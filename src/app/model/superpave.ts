import {Test} from "./test";
import {Bitumen} from "./bitumen";
import {SuperpaveGradation} from "./superpave-gradation";

export interface Superpave {
  id: number;
  sampleBy: string;
  sampleDate: string;
  testBy: string;
  testingDate: string;
  reportNo: string;
  notes: string;
  remarks: string;
  sampleType: string;
  sampleNo: string;
  requestDescription: string;
  asphaltLayer: string;
  equipmentUsed: string;

  projectName: string;
  clientName: string;
  testName: string;
  consultant: string;
  owner: string;
  location: string;
  contractor: string;
  jobOrder: string;
  asphaltApplier: string;
  approveBy: string;
  lastApproveBy: string;
  activist: string;
  adopter: string;
  reportDate: string;

  weightAirDryA: number;
  weightAirDryB: number;
  weightAirSsdA: number;
  weightAirSsdB: number;
  weightWaterA: number;
  weightWaterB: number;
  heightNiniA: number;
  heightNiniB: number;
  heightNdesA: number;
  heightNdesB: number;
  heightNmaxA: number;
  heightNmaxB: number;

  weightAirDryC: number;
  weightAirDryD: number;
  weightAirSsdC: number;
  weightAirSsdD: number;
  weightWaterC: number;
  weightWaterD: number;
  heightNiniC: number;
  heightNiniD: number;
  heightNdesC: number;
  heightNdesD: number;
  heightNmaxC: number;
  heightNmaxD: number;

  netWeightOfLooseMixA: number;
  netWeightOfLooseMixB: number;
  netWeightOfFlaskWaterA: number;
  netWeightOfFlaskWaterB: number;
  weightFlaskWaterSampleA: number;
  weightFlaskWaterSampleB: number;

  gb: number;
  gsb: number;
  gse: number;

  gmmNiniLimits: string;
  gmmNdesLimits: string;
  gmmNmaxLimits: string;
  airvoidsLimits: string;
  vmaLimits: string;
  vfLimits: string;
  dpLimits: string;
  bitumencontentLimits: string;

  percOfAcExpand: string;
  gmmExpand: string;
  gmbExpand: string;
  airvoidExpand: string;
  vmaExpand: string;
  vfExpand: string;
  dpExpand: string;

  superpaveGradation: SuperpaveGradation;
  bitumen: Bitumen;
  test: Test;
}
