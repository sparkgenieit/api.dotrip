// src/main.ts
import { NestFactory }    from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import  cookieParser  from 'cookie-parser';
import { AppModule }      from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  console.log(`🚀 Listening on port ${process.env.PORT || 3000}`);
}
bootstrap();
