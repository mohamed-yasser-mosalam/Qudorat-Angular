import {Test} from "./test";

export interface EnCompressiveStrength {
  id: number;

  projectName: string;
  company: string;
  location: string;
  dataCasting: string;
  dataReceived: string;
  ageDays: number;
  labreportNo: string;
  typeofSample: string;
  structure: string;
  sampleBy: string;
  slump: number;
  temperature: number;
  reqstrengthKg: number;
  sampleNo: string;
  sampleType: string;
  notes: string;

  sampleIdA: string;
  sampleIdB: string;
  sampleIdC: string;
  sampleIdD: string;
  sampleIdE: string;
  sampleIdF: string;

  widthA: number;
  widthB: number;
  widthC: number;
  widthD: number;
  widthE: number;
  widthF: number;

  lengthA: number;
  lengthB: number;
  lengthC: number;
  lengthD: number;
  lengthE: number;
  lengthF: number;

  weightSampleA: number;
  weightSampleB: number;
  weightSampleC: number;
  weightSampleD: number;
  weightSampleE: number;
  weightSampleF: number;

  testLoadknA: number;
  testLoadknB: number;
  testLoadknC: number;
  testLoadknD: number;
  testLoadknE: number;
  testLoadknF: number;

  expAvg: string;

  testName: string;
  adopter: string;
  clientName: string;
  testBy: string;
  approveBy: string;
  lastApproveBy: string;
  activist: string;
  consultant: string;
  owner: string;

  test: Test;
}
