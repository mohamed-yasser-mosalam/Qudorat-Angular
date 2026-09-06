import {Component} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {Test} from "../../../../../model/test";
import {EnCompressiveStrength} from "../../../../../model/en-compressive-strength";
import {EnCompressiveStrengthService} from "../../../../../service/en-compressive-strength/en-compressive-strength.service";

@Component({
  selector: 'app-insert-en-compressive-strength',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './insert-en-compressive-strength.component.html',
  styleUrl: './insert-en-compressive-strength.component.css'
})
export class InsertEnCompressiveStrengthComponent {

  id: number = 0;
  entity: EnCompressiveStrength = {
    test: {} as Test,
    sampleType: '',
    ageDays: 28
  } as EnCompressiveStrength;

  constructor(private service: EnCompressiveStrengthService,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  insert() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.entity.test.id = this.id;
    this.service.insert(this.entity).subscribe({
      next: () => this.router.navigateByUrl(`/en-compressive-strength/${this.id}`),
      error: () => this.router.navigateByUrl(`/en-compressive-strength/${this.id}`)
    });
  }
}
