import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {EnCompressiveStrength} from "../../model/en-compressive-strength";

@Injectable({
  providedIn: 'root'
})
export class EnCompressiveStrengthService {

  constructor(private http: HttpClient) {
  }

  findAll() {
    return this.http.get<EnCompressiveStrength[]>(`${environment.url}en-compressive-strength`);
  }

  findById(id: number) {
    return this.http.get<EnCompressiveStrength>(`${environment.url}en-compressive-strength/${id}`);
  }

  insert(entity: EnCompressiveStrength) {
    return this.http.post<EnCompressiveStrength>(`${environment.url}en-compressive-strength`, entity);
  }

  update(entity: EnCompressiveStrength, id: number) {
    return this.http.put<EnCompressiveStrength>(`${environment.url}en-compressive-strength/${id}`, entity);
  }

  delete(id: number) {
    return this.http.delete<EnCompressiveStrength>(`${environment.url}en-compressive-strength/${id}`);
  }
}
