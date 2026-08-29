import {provideRouter, Routes} from '@angular/router';
import {LoginComponent} from "./component/authentication/login/login.component";
import {DashboardComponent} from "./component/sidebar-component/dashboard/dashboard.component";
import {authGuard} from "./guards/auth.guard";
import {ShowClientComponent} from "./component/sidebar-component/client/show-client/show-client.component";
import {InsertClientComponent} from "./component/sidebar-component/client/insert-client/insert-client.component";
import {UpdateClientComponent} from "./component/sidebar-component/client/update-client/update-client.component";
import {TestReportComponent} from "./component/sidebar-component/test-report/test-report.component";
import {ShowProjectComponent} from "./component/sidebar-component/project/show-project/show-project.component";
import {InsertProjectComponent} from "./component/sidebar-component/project/insert-project/insert-project.component";
import {UpdateProjectComponent} from "./component/sidebar-component/project/update-project/update-project.component";
import {TestComponent} from "./component/sidebar-component/test/test/test.component";
import {InsertTestComponent} from "./component/sidebar-component/test/insert-test/insert-test.component";
import {UpdateTestComponent} from "./component/sidebar-component/test/update-test/update-test.component";
import {TestMangerComponent} from "./component/sidebar-component/setting/test-manger/test-manger/test-manger.component";
import {InsertSandComponent} from "./component/sidebar-component/analsis/sand/insert-sand/insert-sand.component";
import {ShowSandComponent} from "./component/sidebar-component/analsis/sand/show-sand/show-sand.component";
import {UpdateSandComponent} from "./component/sidebar-component/analsis/sand/update-sand/update-sand.component";
import {SandReportComponent} from "./component/sidebar-component/analsis/sand/sand-report/sand-report.component";
import {ProjectInvoiceComponent} from "./component/sidebar-component/project/project-invoice/project-invoice.component";
import {SettingComponent} from "./component/sidebar-component/setting/setting/setting.component";
import {UserManagerComponent} from "./component/sidebar-component/setting/user/user-manager/user-manager.component";
import {InsertUserComponent} from "./component/sidebar-component/setting/user/insert-user/insert-user.component";
import {ProfileComponent} from "./component/shared/profile/profile.component";
import {UpdateUserComponent} from "./component/sidebar-component/setting/user/update-user/update-user.component";
import {HelpComponent} from "./component/sidebar-component/help/help.component";
import {ShowAsphaltComponent} from "./component/sidebar-component/analsis/asphalt/show-asphalt/show-asphalt.component";
import {
  InsertAsphaltComponent
} from "./component/sidebar-component/analsis/asphalt/insert-asphalt/insert-asphalt.component";
import {
  UpdateAsphaltComponent
} from "./component/sidebar-component/analsis/asphalt/update-asphalt/update-asphalt.component";
import {
  AsphaltReportComponent
} from "./component/sidebar-component/analsis/asphalt/asphalt-report/asphalt-report.component";
import {
  ShowCompressiveStrengthComponent
} from "./component/sidebar-component/analsis/compressive-strength/show-compressive-strength/show-compressive-strength.component";
import {
  InsertCompressiveStrengthComponent
} from "./component/sidebar-component/analsis/compressive-strength/insert-compressive-strength/insert-compressive-strength.component";
import {
  UpdateCompressiveStrengthComponent
} from "./component/sidebar-component/analsis/compressive-strength/update-compressive-strength/update-compressive-strength.component";
import {
  CompressiveStrengthReportComponent
} from "./component/sidebar-component/analsis/compressive-strength/compressive-strength-report/compressive-strength-report.component";
import {
  ShowAtterbergComponent
} from "./component/sidebar-component/analsis/atterberg-limits/show-atterberg/show-atterberg.component";
import {
  InsertAtterbergComponent
} from "./component/sidebar-component/analsis/atterberg-limits/insert-atterberg/insert-atterberg.component";
import {
  UpdateAtterbergComponent
} from "./component/sidebar-component/analsis/atterberg-limits/update-atterberg/update-atterberg.component";
import {
  AtterbergReportComponent
} from "./component/sidebar-component/analsis/atterberg-limits/atterberg-report/atterberg-report.component";
import {
  ShowMoistureDensityRelationshipComponent
} from "./component/sidebar-component/analsis/moistureDensity-relationship/show-moisture-density-relationship/show-moisture-density-relationship.component";
import {
  InsertMoistureDensityRelationshipComponent
} from "./component/sidebar-component/analsis/moistureDensity-relationship/insert-moisture-density-relationship/insert-moisture-density-relationship.component";
import {
  UpdateMoistureDensityRelationshipComponent
} from "./component/sidebar-component/analsis/moistureDensity-relationship/update-moisture-density-relationship/update-moisture-density-relationship.component";
import {
  MoistureDensityRelationshipReportComponent
} from "./component/sidebar-component/analsis/moistureDensity-relationship/moisture-density-relationship-report/moisture-density-relationship-report.component";
import {NotificationComponent} from "./component/sidebar-component/notification/notification/notification.component";
import {DbBackupComponent} from "./component/sidebar-component/db-backup/db-backup.component";
import {
  ShowSuperpaveComponent
} from "./component/sidebar-component/analsis/superpave/show-superpave/show-superpave.component";
import {
  InsertSuperpaveComponent
} from "./component/sidebar-component/analsis/superpave/insert-superpave/insert-superpave.component";
import {
  UpdateSuperpaveComponent
} from "./component/sidebar-component/analsis/superpave/update-superpave/update-superpave.component";
import {
  SuperpaveReportComponent
} from "./component/sidebar-component/analsis/superpave/superpave-report/superpave-report.component";

export const routes: Routes = [


  {path: 'login', component: LoginComponent},
  {path: 'dashboard', component: DashboardComponent, canActivate: [authGuard]},
  {path: 'profile', component: ProfileComponent, canActivate: [authGuard]},
  {path: 'notification', component: NotificationComponent, canActivate: [authGuard]},

  { path: 'clients', component: ShowClientComponent, canActivate: [authGuard] },
  { path: 'clients/insert', component: InsertClientComponent, canActivate: [authGuard] },
  { path: 'clients/update/:id', component: UpdateClientComponent, canActivate: [authGuard] },

  { path: 'projects', component: ShowProjectComponent, canActivate: [authGuard] },
  { path: 'projects/insert', component: InsertProjectComponent, canActivate: [authGuard] },
  { path: 'projects/update/:id', component: UpdateProjectComponent, canActivate: [authGuard] },
  { path: 'projects/invoice/:id', component: ProjectInvoiceComponent, canActivate: [authGuard] },

  { path: 'tests', component: TestComponent, canActivate: [authGuard] },
  { path: 'tests/insert', component: InsertTestComponent, canActivate: [authGuard] },
  { path: 'tests/update/:id', component: UpdateTestComponent, canActivate: [authGuard] },

  { path: 'sands/:id', component: ShowSandComponent, canActivate: [authGuard] },
  { path: 'sands/insert/:id', component: InsertSandComponent, canActivate: [authGuard] },
  { path: 'sands/update/:id', component: UpdateSandComponent, canActivate: [authGuard] },
  { path: 'sands/report/:id', component: SandReportComponent, canActivate: [authGuard] },

  { path: 'asphalt/:id', component: ShowAsphaltComponent, canActivate: [authGuard] },
  { path: 'asphalt/insert/:id', component: InsertAsphaltComponent, canActivate: [authGuard] },
  { path: 'asphalt/update/:id', component: UpdateAsphaltComponent, canActivate: [authGuard] },
  { path: 'asphalt/report/:id', component: AsphaltReportComponent, canActivate: [authGuard] },

  { path: 'compressive-strength/:id', component: ShowCompressiveStrengthComponent, canActivate: [authGuard] },
  { path: 'compressive-strength/insert/:id', component: InsertCompressiveStrengthComponent, canActivate: [authGuard] },
  { path: 'compressive-strength/update/:id', component: UpdateCompressiveStrengthComponent, canActivate: [authGuard] },
  { path: 'compressive-strength/report/:id', component: CompressiveStrengthReportComponent, canActivate: [authGuard] },

  { path: 'atterberg/:id', component: ShowAtterbergComponent, canActivate: [authGuard] },
  { path: 'atterberg/insert/:id', component: InsertAtterbergComponent, canActivate: [authGuard] },
  { path: 'atterberg/update/:id', component: UpdateAtterbergComponent, canActivate: [authGuard] },
  { path: 'atterberg/report/:id', component: AtterbergReportComponent, canActivate: [authGuard] },

  { path: 'moisture-density-relationship/:id', component: ShowMoistureDensityRelationshipComponent, canActivate: [authGuard] },
  { path: 'moisture-density-relationship/insert/:id', component: InsertMoistureDensityRelationshipComponent, canActivate: [authGuard] },
  { path: 'moisture-density-relationship/update/:id', component: UpdateMoistureDensityRelationshipComponent, canActivate: [authGuard] },
  { path: 'moisture-density-relationship/report/:id', component: MoistureDensityRelationshipReportComponent, canActivate: [authGuard] },

  { path: 'superpave/:id', component: ShowSuperpaveComponent, canActivate: [authGuard] },
  { path: 'superpave/insert/:id', component: InsertSuperpaveComponent, canActivate: [authGuard] },
  { path: 'superpave/update/:id', component: UpdateSuperpaveComponent, canActivate: [authGuard] },
  { path: 'superpave/report/:id', component: SuperpaveReportComponent, canActivate: [authGuard] },

  {path: 'report', component: TestReportComponent, canActivate: [authGuard]},
  {path: 'db-backup', component: DbBackupComponent, canActivate: [authGuard]},


  {path: 'setting', component: SettingComponent, canActivate: [authGuard]},
  {path: 'setting/test-manager', component: TestMangerComponent, canActivate: [authGuard]},
  {path: 'setting/user-manager', component: UserManagerComponent, canActivate: [authGuard]},
  {path: 'setting/user-manager/insert', component: InsertUserComponent, canActivate: [authGuard]},
  {path: 'setting/user-manager/update/:id', component: UpdateUserComponent, canActivate: [authGuard]},


  {path: 'help', component: HelpComponent, canActivate: [authGuard]},

  {path: '**', redirectTo: 'login'},
];
export const appRouterProviders = [provideRouter(routes)];
