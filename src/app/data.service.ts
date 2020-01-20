import { environment } from './../environments/environment';
import { LoadingController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of , throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  apiendpoint = environment.apiendPoint;
  constructor(private httpClient: HttpClient, private loadingController: LoadingController) {

   }

   /**Insert data*/

  insertData(body): Observable<any> {
    const url = '/devices/insertdevicedata';
    const htteaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.post(this.apiendpoint + url, body, { headers: htteaders, observe: 'response'})
    .pipe(
      tap(_ => this.log('response received')),
      // catchError(this.handleError('Register', []))
      // map((response: any) => response.json()),
      catchError(this.handleError)
    );
  }

  /**get data*/

  getDatafrom(body): Observable<any> {
    const url = '/devices/getdevicedata';
    const htteaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.post(this.apiendpoint + url, body, { headers: htteaders, observe: 'response'})
    .pipe(
      tap(_ => this.log('response received')),
      // catchError(this.handleError('Register', []))
      // map((response: any) => response.json()),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) { 
    let errMsg = (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    return throwError(error);
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    console.log(message);
  }

   /**Show loading controller */
  showLoadingController() {
    this.loadingController.create({
      message: 'Loading please wait...',
      backdropDismiss: false,
      mode: 'ios',
      spinner: 'bubbles'
    }).then(res => {
      res.present();
    });
  }

  hideLoadingController() {
    this.loadingController.dismiss();
  }
}
