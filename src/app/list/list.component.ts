import { Component, OnInit } from '@angular/core';
import { ComboApiService } from '../combo-api.service'

import * as compareVersions from 'compare-versions'

interface BaseVersionInformation {
  hash: string;
  size: number;
}

interface AdditionalVersionInformation {
  src_type: string;
  commit_hash: string;
  remote_url: string;
}

class ProjectVersion {
  baseVersionInformation: BaseVersionInformation;
  additionalVersionInformation: Map<string, string>;
}

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})

export class ListComponent implements OnInit {
  readonly PROJECT_TITLE_REGEX = new RegExp(/^\(([^,]+), v((0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-((?:0|[1-9][0-9]*|[0-9]*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9][0-9]*|[0-9]*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)\)$/);
  readonly PROJECT_TITLE_REGEX_PROJECT_NAME_GROUP_ID = 1
  readonly PROJECT_TITLE_REGEX_SEMANTIC_VERSION_GROUP_ID = 2

  readonly GIT = "git";
  comboProjects : Map<string, Map<string, ProjectVersion>> = new Map();

  constructor(private _comboService: ComboApiService) { }

  ngOnInit(): void {
    this._comboService.getAvaliableVersions().subscribe(data => {
      let versionsParsed = this.ParseAvaliableVersionsBaseInfo(data);
      for (let i = 0; i < versionsParsed.length; i++)
      {
        let versionAndName = versionsParsed[i];
        this._comboService.getProjectSource(versionAndName[0], versionAndName[1].replace(" ", "+")).subscribe(data => {
          this.ParseAdditionalInfoFromServer(data, versionAndName);
        });
      }
    });

    console.log(this.comboProjects);
  }

  ParseAvaliableVersionsBaseInfo(data: Object) : Array<[string, string]>
  {
    let baseVersionMap = (JSON.parse(data.toString())) as Map<string, BaseVersionInformation>    
    let returnedVersionsParsed = new Array<[string, string]>();

    for (const projectTitle in baseVersionMap) {
      let versionAndName = this.FetchVersionAndNameFromTitle(projectTitle);
      if (versionAndName == null || versionAndName[0] == null || versionAndName[1] == null)
      {
        continue
      }

      let projectVersion = new ProjectVersion();
      projectVersion.baseVersionInformation = baseVersionMap[projectTitle];

      if (this.comboProjects.get(versionAndName[1]) == null)
      {
        this.comboProjects.set(versionAndName[1], new Map());
      }

      this.comboProjects.get(versionAndName[1]).set(versionAndName[0], projectVersion);
      returnedVersionsParsed.push(versionAndName);
    }

    return returnedVersionsParsed;
  }

  ParseAdditionalInfoFromServer(data: Object, versionAndName: [string, string])
  {
    if (versionAndName == null || versionAndName[0] == null || versionAndName[1] == null || 
      this.comboProjects.get(versionAndName[1]) == null || this.comboProjects.get(versionAndName[1]).get(versionAndName[0]) == null)
    {
      return
    }
 
    let addition_version_information = (JSON.parse(data.toString()) as Map<string, string>);
    this.comboProjects.get(versionAndName[1]).get(versionAndName[0]).additionalVersionInformation = addition_version_information
  }
  
  FetchVersionAndNameFromTitle(title: string) : [string, string]
  {
    var match = this.PROJECT_TITLE_REGEX.exec(title);

    if (match != null && match.length >= Math.max(this.PROJECT_TITLE_REGEX_PROJECT_NAME_GROUP_ID,
      this.PROJECT_TITLE_REGEX_SEMANTIC_VERSION_GROUP_ID))
    {
      let projectName = match[this.PROJECT_TITLE_REGEX_PROJECT_NAME_GROUP_ID];
      let projectSemanticVersion = match[this.PROJECT_TITLE_REGEX_SEMANTIC_VERSION_GROUP_ID];
      return [projectSemanticVersion, projectName]
    }
    else
    {
      return [null, null]
    }
  }

  CompareSemanticVersionOfKeys(a, b) {
    return compareVersions(a.key, b.key);
  }

  SafeGet(versionMap: Map<string,ProjectVersion> , version: string) : Object
  {
    return versionMap?.get(version);
  }
}