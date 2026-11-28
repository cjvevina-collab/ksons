import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const firebaseConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'src/firebase-config.json'), 'utf8')
) as { apiKey: string };

const ADMIN_UID = 'cpor2Dw8yOf5d0FBMtnbkmtvF7I3';
const PORT = 3000;

async function verifyAdminFirebaseToken(idToken: string): Promise<boolean> {
  if (!idToken || idToken.length > 4096) return false;
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseConfig.apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!response.ok) return false;
    const data = (await response.json()) as {
      users?: Array<{ localId?: string }>;
    };
    const uid = data.users?.[0]?.localId;
    return uid === ADMIN_UID;
  } catch {
    return false;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  app.use(
    (
      err: { type?: string; status?: number } | null,
      _req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (err?.type === 'entity.too.large' || err?.status === 413) {
        res.status(413).json({
          error: 'Image is too large. Please select a smaller image (under 15 MB).',
        });
        return;
      }
      if (err) {
        res.status(400).json({ error: 'Invalid upload request payload.' });
        return;
      }
      next();
    }
  );

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, imgbbConfigured: Boolean(process.env.IMGBB_API_KEY?.trim()) });
  });

  app.post('/api/upload-image', async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice('Bearer '.length).trim()
        : '';

      if (!token) {
        res.status(401).json({ error: 'Authentication required.' });
        return;
      }

      const isAuthorized = await verifyAdminFirebaseToken(token);
      if (!isAuthorized) {
        res.status(403).json({ error: 'Admin access denied.' });
        return;
      }

      const imgbbKey = process.env.IMGBB_API_KEY?.trim();
      if (!imgbbKey) {
        res.status(503).json({
          error:
            'IMGBB_API_KEY is not configured in server environment secrets.',
        });
        return;
      }

      const { imageBase64, name } = (req.body || {}) as {
        imageBase64?: string;
        name?: string;
      };

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        res.status(400).json({ error: 'Valid base64 image data is required.' });
        return;
      }

      const cleanedBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '').trim();
      if (!cleanedBase64) {
        res.status(400).json({ error: 'Empty image payload.' });
        return;
      }
      if (cleanedBase64.length > 20 * 1024 * 1024) {
        res.status(413).json({ error: 'Image size exceeds upload limit.' });
        return;
      }

      const form = new FormData();
      form.append('key', imgbbKey);
      form.append('image', cleanedBase64);
      if (name && typeof name === 'string' && name.trim()) {
        form.append('name', name.trim().slice(0, 64));
      }

      const uploadResp = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          Origin: 'https://imgbb.com',
          Referer: 'https://imgbb.com/',
        },
        body: form,
      });

      const respText = await uploadResp.text();
      let result: {
        success?: boolean;
        data?: { url?: string; display_url?: string };
        error?: { message?: string };
      } = {};
      try {
        result = JSON.parse(respText) as typeof result;
      } catch {
        res.status(502).json({
          error: 'Unexpected response from ImgBB server. Please try again.',
        });
        return;
      }

      const uploadedUrl = result.data?.display_url || result.data?.url;
      if (!uploadResp.ok || !result.success || !uploadedUrl) {
        res.status(502).json({
          error: result.error?.message || 'ImgBB upload failed.',
        });
        return;
      }

      res.json({ url: uploadedUrl });
    } catch {
      res.status(500).json({ error: 'Failed to process image upload.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
