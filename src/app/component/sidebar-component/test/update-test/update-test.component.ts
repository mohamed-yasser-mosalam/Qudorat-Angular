import {Component, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {Test} from "../../../../model/test";
import {Project} from "../../../../model/project";
import {TestService} from "../../../../service/test/test.service";
import {ProjectService} from "../../../../service/project/project.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TestManager} from "../../../../model/test-manager";
import {TestManagerService} from "../../../../service/test-manager/test-manager.service";

@Component({
  selector: 'app-update-test',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './update-test.component.html',
  styleUrl: './update-test.component.css'
})
export class UpdateTestComponent implements OnInit {

  test: Test = {project: {} as Project, testManager: {} as TestManager} as Test;
  projects: Project[] = [];
  price: number = 0;
  id: number = 0;
  testManagers: TestManager[] = [];

  constructor(private service: TestService, private projectService: ProjectService, private testManagerService: TestManagerService,
              private router: Router , private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.service.findById(this.id).subscribe(res => {
      this.test = res;
      // When loading an existing test, ensure the conditional fields reflect the current test manager
      if (this.test && this.test.testManager && this.test.testManager.id != null) {
        // Use the same logic as the change handler to set price and extra fields visibility
        this.onSideChange(Number(this.test.testManager.id));
      }
    });
    this.projectService.findAll().subscribe(res => this.projects = res);
    this.testManagerService.findAll().subscribe(res => this.testManagers = res);
  }

  get showExtraFields(): boolean {
    return this.isAsphaltOrSuperpave(this.test?.testManager);
  }

  onSideChange(id: number | string) {
    const tm = this.testManagers.find(t => t.id == id);
    if (!tm) {
      this.testManagerService.findById(Number(id)).subscribe(res => {
        this.price = res.price;
        this.test.price = res.price;
      });
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
    this.service.update(this.test , this.id).subscribe(() =>
      this.router.navigateByUrl('/tests')
    )
  }

}
