// src/main.ts
import { NestFactory }    from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import  cookieParser  from 'cookie-parser';
import { AppModule }      from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  }));

    const port = Number(process.env.PORT) || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Listening on http://localhost:${port}`);

}
bootstrap();
