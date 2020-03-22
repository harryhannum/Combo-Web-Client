import { Component, OnInit } from '@angular/core';
import { ComboApiService } from '../combo-api.service'

interface ComboProject {
  src_type: string;
  commit_hash: string;
  remote_url: string;
}

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})

export class ListComponent implements OnInit {
  avaliableVersionJSON : Object
  avaliableVersionsMap : Map<string, Object>
  avaliableVersionKeys : Array<string> = []
  retrievedComboProjects : Array<ComboProject> = []

  constructor(private _comboService: ComboApiService) { }

  ngOnInit(): void {

    this._comboService.getAvaliableVersions().subscribe(data => {
      this.RetreiveInfoFromServer(data);
      this.ParseServerInfo();

    });
  }

  RetreiveInfoFromServer(data: Object)
  {
    this.avaliableVersionsMap = JSON.parse(data.toString())
    for (const key in this.avaliableVersionsMap) {
      this.avaliableVersionKeys.push(key);
    }
  }

  ParseServerInfo()
  {
    for (let i = 0; i <= this.avaliableVersionKeys.length; i++)
    {
      // (Combo Core, v0.1.1)
      // ^\(([^,]+), v([0-9]{0,10}\.[0-9]{0,10}\.[0-9a-zA-Z]{0,10})\)$
      // ^\(([^,]+), v((0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-((?:0|[1-9][0-9]*|[0-9]*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9][0-9]*|[0-9]*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)\)$
      const project_title_regex = new RegExp(/^\(([^,]+), v((0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-((?:0|[1-9][0-9]*|[0-9]*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9][0-9]*|[0-9]*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)\)$/);
      
      console.log(this.avaliableVersionKeys[i]);
      var match = project_title_regex.exec(this.avaliableVersionKeys[i]);
      if (match != null)
      {
        this._comboService.getProjectSource(match[2], match[1].replace(" ", "+")).subscribe(data => {
          this.retrievedComboProjects.push(JSON.parse(data.toString()))
          console.log(this.retrievedComboProjects)
        });
      }
    }
  }

}
