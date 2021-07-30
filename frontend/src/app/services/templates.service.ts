import { Injectable, Type } from '@angular/core';
import { TestComponent } from '../views/reports/entry/templates/test/test.component';
import { ITemplate } from '../interfaces/ITemplate';
import { PlainDataComponent } from '../views/reports/entry/templates/plain-data/plain-data.component';

@Injectable({
  providedIn: 'root'
})
export class TemplatesService {

  private templates: ITemplate[] = [
    { name: "Test Template", key: "test-template", component: TestComponent },
    { name: "Plain Data", key: "plain-data", component: PlainDataComponent }
  ];

  constructor() {
  }

  register(name: string, key: string, component: Type<any>) {
    let newTemaplte: ITemplate = {
      name: name,
      key: key,
      component: component
    }
    this.templates.push(newTemaplte);
  }

  getAllTemplatesData() {
    return this.templates;
  }

  loadComponentOf(templateKey) {
    let component = null;

    for (let i = 0; i < this.templates.length; i++) {
      if (templateKey == this.templates[i].key) {
        component = this.templates[i].component;
        break;
      }
    }

    return component;
  }

  loadNameOf(templateKey) {
    let name = null;

    for (let i = 0; i < this.templates.length; i++) {
      if (templateKey == this.templates[i].key) {
        name = this.templates[i].name;
        break;
      }
    }

    return name;
  }
}
