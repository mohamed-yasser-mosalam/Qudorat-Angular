import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {Test} from "../../../../../model/test";
import {EnCompressiveStrength} from "../../../../../model/en-compressive-strength";
import {EnCompressiveStrengthService} from "../../../../../service/en-compressive-strength/en-compressive-strength.service";

@Component({
  selector: 'app-update-en-compressive-strength',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './update-en-compressive-strength.component.html',
  styleUrl: './update-en-compressive-strength.component.css'
})
export class UpdateEnCompressiveStrengthComponent implements OnInit {

  entity: EnCompressiveStrength = {test: {} as Test} as EnCompressiveStrength;
  id: number = 0;

  constructor(private service: EnCompressiveStrengthService,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.service.findById(this.id).subscribe(res => {
      this.entity = res;
    });
  }

  update() {
    this.service.update(this.entity, this.id).subscribe(
      () => this.router.navigateByUrl(`/tests`)
    );
  }
}
