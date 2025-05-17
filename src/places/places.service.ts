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
    try {
      const response = await this.client.placeAutocomplete({
        params: {
          input,
          key: this.apiKey,
          sessiontoken,
          components: 'country:in',
          types: 'geocode',
          language: 'en',
        },
        timeout: 1000,
      });

      if (response.data.status !== 'OK') {
        return [];
      }
      return response.data.predictions;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to fetch place predictions');
    }
  }
}