import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[templateHost]'
})
export class TemplateDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
