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
  app.use(express.json({ limit: '10mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, imgbbConfigured: Boolean(process.env.IMGBB_API_KEY) });
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

      const imgbbKey = process.env.IMGBB_API_KEY;
      if (!imgbbKey) {
        res.status(503).json({
          error:
            'IMGBB_API_KEY is not configured in server secrets yet. Please add IMGBB_API_KEY in Settings -> Secrets or paste an image URL directly.',
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

      const cleanedBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
      if (cleanedBase64.length > 9 * 1024 * 1024) {
        res.status(413).json({ error: 'Image size exceeds upload limit.' });
        return;
      }

      const form = new URLSearchParams();
      form.append('key', imgbbKey);
      form.append('image', cleanedBase64);
      if (name && typeof name === 'string') {
        form.append('name', name.slice(0, 64));
      }

      const uploadResp = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });

      const result = (await uploadResp.json()) as {
        success?: boolean;
        data?: { url?: string; display_url?: string };
        error?: { message?: string };
      };

      if (!uploadResp.ok || !result.success || !result.data?.url) {
        res.status(502).json({
          error: result.error?.message || 'ImgBB upload failed.',
        });
        return;
      }

      res.json({
        url: result.data.display_url || result.data.url,
      });
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
