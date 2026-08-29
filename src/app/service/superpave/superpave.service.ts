import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Superpave} from "../../model/superpave";

@Injectable({
  providedIn: 'root'
})
export class SuperpaveService {

  constructor(private http: HttpClient) {
  }

  findAll() {
    return this.http.get<Superpave[]>(`${environment.url}superpave`);
  }

  findById(id: number) {
    return this.http.get<Superpave>(`${environment.url}superpave/${id}`);
  }

  insert(superpave: Superpave) {
    return this.http.post<Superpave>(`${environment.url}superpave`, superpave);
  }

  update(superpave: Superpave, id: number) {
    return this.http.put<Superpave>(`${environment.url}superpave/${id}`, superpave);
  }

  delete(id: number) {
    return this.http.delete<Superpave>(`${environment.url}superpave/${id}`);
  }
}
