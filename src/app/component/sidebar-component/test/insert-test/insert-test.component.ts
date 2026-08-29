import {Component, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {Project} from "../../../../model/project";
import {ProjectService} from "../../../../service/project/project.service";
import {Router} from "@angular/router";
import {Test} from "../../../../model/test";
import {TestService} from "../../../../service/test/test.service";
import {TestManager} from "../../../../model/test-manager";
import {TestManagerService} from "../../../../service/test-manager/test-manager.service";

@Component({
  selector: 'app-insert-test',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    ReactiveFormsModule,
    NgIf,
  ],
  templateUrl: './insert-test.component.html',
  styleUrl: './insert-test.component.css'
})
export class InsertTestComponent implements OnInit {

  test: Test = {project: {} as Project, testManager: {} as TestManager} as Test;
  price: number = 0;
  projects: Project[] = [];
  testManagers: TestManager[] = [];

  constructor(private service: TestService, private projectService: ProjectService, private testManagerService: TestManagerService,
              private router: Router) {
  }

  ngOnInit() {
    this.projectService.findAll().subscribe(res => this.projects = res);
    this.testManagerService.findAll().subscribe(res => this.testManagers = res);
  }

  get showExtraFields(): boolean {
    return this.isAsphaltOrSuperpave(this.test?.testManager);
  }

  onSideChange(id: number | string) {
    const tm = this.testManagers.find(t => t.id == id);
    if (!tm) {
      return;
    }
    this.test.testManager = { ...this.test.testManager, id: tm.id, name: tm.name, price: tm.price };
    this.price = tm.price;
    this.test.price = tm.price;
    if (!this.isAsphaltOrSuperpave(tm)) {
      this.test.contractor = '';
      this.test.jobOrder = '';
      this.test.asphaltApplier = '';
    }
  }

  private isAsphaltOrSuperpave(tm?: TestManager | null): boolean {
    if (!tm) {
      return false;
    }
    const listed = this.testManagers.find(t => t.id == tm.id);
    const name = (listed?.name || tm.name || '').toLowerCase().replace(/\s+/g, '');
    return Number(tm.id) === 2 || name.includes('asphaltmarshall') || name.includes('superpave');
  }

  insert() {
    const tmId = Number(this.test.testManager?.id);
    this.test.testManager = { ...(this.test.testManager || {} as TestManager), id: tmId };
    this.test.price = this.price || this.test.price;
    this.service.insert(this.test).subscribe({
      next: () => {
        this.router.navigateByUrl('/tests');
      },
      error: () => {
        this.router.navigateByUrl('/tests');
      }
    });
  }
}
