import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class ComboApiService {
  readonly server_address = "127.0.0.1"
  readonly port = "9595"

  constructor(private http: HttpClient) { }

  getProjectSource(project_version: string, project_name: string) {
    let get_request_url = `http://${this.server_address}:${this.port}/get_source?project_version=${project_version}&project_name=${project_name}`;
    return this.http.get(get_request_url)
  }

  getAvaliableVersions() {
    let get_request_url = `http://${this.server_address}:${this.port}/get_available_versions`;
    return this.http.get(get_request_url)
  }
}
