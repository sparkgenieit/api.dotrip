// src/main.ts
import { NestFactory }    from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import  cookieParser  from 'cookie-parser';
import { AppModule }      from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ⬇️ Increase request size limits (handles base64 images)
const BODY_LIMIT = process.env.BODY_LIMIT || '20mb';
app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT }));

    // ✅ Serve static files from uploads/ (this is the fix)
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // parse cookies first
  app.use(cookieParser());

app.enableCors({
  origin: (origin, callback) => {
    const allowedOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_URL];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
});


  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));


    const port = Number(process.env.PORT) || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Listening on http://localhost:${port}`);

}
bootstrap();
