import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { firstValueFrom } from 'rxjs';
import { Client } from '@googlemaps/google-maps-services-js';

@Injectable()
export class PlacesService {
  private client:any;
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
  

  constructor(
    private readonly http: HttpService,
  ) {
     this.client = new Client();
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

async getAutocomplete(input: string, sessiontoken: string) {
  const q = (input || '').trim();
  if (!q) return [];

  // Feature flag: bypass Google when the key is missing/expired or you set PLACES_DISABLE_GOOGLE=1
  if (!this.apiKey || process.env.PLACES_DISABLE_GOOGLE === '1') {
    return [];
  }

  try {
    const response = await this.client.placeAutocomplete({
      params: {
        input: q,
        key: this.apiKey,
        sessiontoken,
        components: 'country:in',
        types: 'geocode',
        language: 'en',
      },
      timeout: Number(process.env.GOOGLE_MAPS_TIMEOUT_MS ?? 5000), // more realistic than 1000
    });

    // Gracefully handle denials, over-quota, etc.
    const data = response?.data;
    if (data?.status === 'OK' && Array.isArray(data.predictions)) {
      return data.predictions;
    }
    return []; // REQUEST_DENIED / ZERO_RESULTS / anything else
  } catch (err) {
    // Do NOT throw → keep UI working while key is expired
    // Optionally log a compact message:
    // console.warn('Places autocomplete failed:', err?.response?.data?.status || err?.message);
    return [];
  }
}

}