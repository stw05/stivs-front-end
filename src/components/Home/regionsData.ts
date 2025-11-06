export interface RegionMetrics {
  projects: {
    total: number;
    grants: number;
    programs: number;
    contracts: number;
    commercialization: number;
    avgDuration: number;
  };
  publications: {
    total: number;
    journals: number;
    conferences: number;
    books: number;
    other: number;
  };
  people: {
    total: number;
    docents: number;
    professors: number;
    associateProfessors: number;
    avgAge: number;
  };
  finances: {
    total: number;
    lastYear: number;
    avgExpense: number;
    budgetUsage: number;
    regionalPrograms: number;
  };
}

export interface RegionShape {
  id: string;
  name: string;
  shortName: string;
  path: string;
  labelPosition: { x: number; y: number };
  stats: RegionMetrics;
}

export const regionsData: RegionShape[] = [
  {
    id: 'wko',
    name: 'Западно-Казахстанская область',
    shortName: 'ЗКО',
    path: 'M120 280 L200 236 L250 256 L240 316 L170 332 L126 306 Z',
    labelPosition: { x: 180, y: 290 },
    stats: {
      projects: { total: 420, grants: 150, programs: 110, contracts: 95, commercialization: 65, avgDuration: 22 },
      publications: { total: 880, journals: 320, conferences: 190, books: 90, other: 280 },
      people: { total: 2150, docents: 520, professors: 240, associateProfessors: 160, avgAge: 46 },
      finances: { total: 42, lastYear: 14.3, avgExpense: 310, budgetUsage: 87, regionalPrograms: 14 },
    },
  },
  {
    id: 'atyrau',
    name: 'Атырауская область',
    shortName: 'АТЫ',
    path: 'M150 348 L222 334 L260 360 L244 408 L184 404 L146 374 Z',
    labelPosition: { x: 205, y: 370 },
    stats: {
      projects: { total: 365, grants: 120, programs: 90, contracts: 85, commercialization: 70, avgDuration: 20 },
      publications: { total: 620, journals: 210, conferences: 140, books: 70, other: 200 },
      people: { total: 1820, docents: 410, professors: 190, associateProfessors: 135, avgAge: 44 },
      finances: { total: 38, lastYear: 12.6, avgExpense: 295, budgetUsage: 90, regionalPrograms: 11 },
    },
  },
  {
    id: 'mangystau',
    name: 'Мангистауская область',
    shortName: 'МАН',
    path: 'M126 412 L188 408 L226 436 L210 480 L154 474 L126 444 Z',
    labelPosition: { x: 182, y: 440 },
    stats: {
      projects: { total: 280, grants: 95, programs: 70, contracts: 62, commercialization: 53, avgDuration: 18 },
      publications: { total: 470, journals: 155, conferences: 110, books: 55, other: 150 },
      people: { total: 1540, docents: 360, professors: 150, associateProfessors: 102, avgAge: 43 },
      finances: { total: 31, lastYear: 10.4, avgExpense: 278, budgetUsage: 88, regionalPrograms: 9 },
    },
  },
  {
    id: 'aktobe',
    name: 'Актюбинская область',
    shortName: 'АКТ',
    path: 'M240 264 L326 224 L382 244 L366 312 L282 322 L238 300 Z',
    labelPosition: { x: 310, y: 270 },
    stats: {
      projects: { total: 510, grants: 180, programs: 130, contracts: 110, commercialization: 90, avgDuration: 24 },
      publications: { total: 920, journals: 330, conferences: 210, books: 110, other: 270 },
      people: { total: 2420, docents: 600, professors: 280, associateProfessors: 190, avgAge: 45 },
      finances: { total: 55, lastYear: 18.2, avgExpense: 325, budgetUsage: 85, regionalPrograms: 18 },
    },
  },
  {
    id: 'kostanay',
    name: 'Костанайская область',
    shortName: 'КОС',
    path: 'M340 210 L408 176 L470 196 L450 246 L382 250 L338 234 Z',
    labelPosition: { x: 405, y: 210 },
    stats: {
      projects: { total: 480, grants: 160, programs: 135, contracts: 105, commercialization: 80, avgDuration: 23 },
      publications: { total: 860, journals: 300, conferences: 190, books: 95, other: 275 },
      people: { total: 2280, docents: 560, professors: 260, associateProfessors: 180, avgAge: 47 },
      finances: { total: 49, lastYear: 16.2, avgExpense: 305, budgetUsage: 86, regionalPrograms: 16 },
    },
  },
  {
    id: 'north-kazakhstan',
    name: 'Северо-Казахстанская область',
    shortName: 'СКО',
    path: 'M452 180 L526 158 L562 192 L544 234 L472 226 L448 206 Z',
    labelPosition: { x: 510, y: 200 },
    stats: {
      projects: { total: 390, grants: 145, programs: 105, contracts: 80, commercialization: 60, avgDuration: 21 },
      publications: { total: 780, journals: 270, conferences: 170, books: 82, other: 258 },
      people: { total: 2040, docents: 500, professors: 230, associateProfessors: 150, avgAge: 46 },
      finances: { total: 44, lastYear: 14.8, avgExpense: 292, budgetUsage: 89, regionalPrograms: 13 },
    },
  },
  {
    id: 'akmola',
    name: 'Акмолинская область',
    shortName: 'АКМ',
    path: 'M420 238 L478 224 L524 244 L512 290 L444 298 L406 276 Z',
    labelPosition: { x: 470, y: 270 },
    stats: {
      projects: { total: 540, grants: 190, programs: 145, contracts: 120, commercialization: 85, avgDuration: 25 },
      publications: { total: 940, journals: 340, conferences: 220, books: 120, other: 260 },
      people: { total: 2560, docents: 620, professors: 310, associateProfessors: 210, avgAge: 45 },
      finances: { total: 57, lastYear: 19.4, avgExpense: 318, budgetUsage: 86, regionalPrograms: 19 },
    },
  },
  {
    id: 'pavlodar',
    name: 'Павлодарская область',
    shortName: 'ПАВ',
    path: 'M548 204 L618 190 L656 224 L636 272 L572 262 L536 238 Z',
    labelPosition: { x: 610, y: 235 },
    stats: {
      projects: { total: 470, grants: 155, programs: 130, contracts: 95, commercialization: 90, avgDuration: 24 },
      publications: { total: 910, journals: 320, conferences: 210, books: 108, other: 272 },
      people: { total: 2380, docents: 570, professors: 280, associateProfessors: 190, avgAge: 46 },
      finances: { total: 53, lastYear: 17.5, avgExpense: 308, budgetUsage: 88, regionalPrograms: 17 },
    },
  },
  {
    id: 'east-kazakhstan',
    name: 'Восточно-Казахстанская область',
    shortName: 'ВКО',
    path: 'M636 272 L700 246 L748 284 L734 340 L672 334 L626 310 Z',
    labelPosition: { x: 690, y: 300 },
    stats: {
      projects: { total: 600, grants: 210, programs: 165, contracts: 130, commercialization: 95, avgDuration: 26 },
      publications: { total: 1120, journals: 380, conferences: 260, books: 140, other: 340 },
      people: { total: 3040, docents: 730, professors: 360, associateProfessors: 250, avgAge: 44 },
      finances: { total: 69, lastYear: 22.8, avgExpense: 336, budgetUsage: 87, regionalPrograms: 22 },
    },
  },
  {
    id: 'abai',
    name: 'Абайская область',
    shortName: 'АБАЙ',
    path: 'M630 320 L678 318 L714 352 L694 394 L640 386 L616 346 Z',
    labelPosition: { x: 665, y: 360 },
    stats: {
      projects: { total: 350, grants: 120, programs: 95, contracts: 68, commercialization: 67, avgDuration: 23 },
      publications: { total: 640, journals: 220, conferences: 150, books: 72, other: 198 },
      people: { total: 1880, docents: 440, professors: 210, associateProfessors: 140, avgAge: 45 },
      finances: { total: 36, lastYear: 11.8, avgExpense: 286, budgetUsage: 89, regionalPrograms: 12 },
    },
  },
  {
    id: 'jetisu',
    name: 'Жетысуская область',
    shortName: 'ЖТС',
    path: 'M588 358 L634 350 L666 388 L642 432 L598 428 L572 384 Z',
    labelPosition: { x: 620, y: 400 },
    stats: {
      projects: { total: 320, grants: 110, programs: 88, contracts: 62, commercialization: 60, avgDuration: 22 },
      publications: { total: 590, journals: 205, conferences: 135, books: 68, other: 182 },
      people: { total: 1760, docents: 420, professors: 190, associateProfessors: 130, avgAge: 44 },
      finances: { total: 34, lastYear: 11, avgExpense: 280, budgetUsage: 90, regionalPrograms: 11 },
    },
  },
  {
    id: 'almaty',
    name: 'Алматинская область',
    shortName: 'АЛМ',
    path: 'M540 372 L592 362 L616 404 L588 448 L540 440 L520 398 Z',
    labelPosition: { x: 566, y: 412 },
    stats: {
      projects: { total: 580, grants: 205, programs: 150, contracts: 120, commercialization: 105, avgDuration: 25 },
      publications: { total: 990, journals: 340, conferences: 230, books: 120, other: 300 },
      people: { total: 2860, docents: 680, professors: 340, associateProfessors: 240, avgAge: 43 },
      finances: { total: 62, lastYear: 20.4, avgExpense: 330, budgetUsage: 91, regionalPrograms: 20 },
    },
  },
  {
    id: 'zhambyl',
    name: 'Жамбылская область',
    shortName: 'ЖАМ',
    path: 'M494 392 L540 382 L568 426 L536 470 L486 458 L470 418 Z',
    labelPosition: { x: 518, y: 436 },
    stats: {
      projects: { total: 410, grants: 145, programs: 112, contracts: 86, commercialization: 67, avgDuration: 21 },
      publications: { total: 720, journals: 250, conferences: 180, books: 85, other: 205 },
      people: { total: 2120, docents: 500, professors: 230, associateProfessors: 160, avgAge: 45 },
      finances: { total: 41, lastYear: 13.5, avgExpense: 288, budgetUsage: 88, regionalPrograms: 13 },
    },
  },
  {
    id: 'turkistan',
    name: 'Туркестанская область',
    shortName: 'ТРК',
    path: 'M438 378 L500 360 L526 402 L498 440 L446 434 L420 398 Z',
    labelPosition: { x: 476, y: 394 },
    stats: {
      projects: { total: 640, grants: 230, programs: 170, contracts: 130, commercialization: 110, avgDuration: 24 },
      publications: { total: 1080, journals: 360, conferences: 260, books: 130, other: 330 },
      people: { total: 3220, docents: 760, professors: 360, associateProfessors: 260, avgAge: 42 },
      finances: { total: 74, lastYear: 24.6, avgExpense: 342, budgetUsage: 92, regionalPrograms: 24 },
    },
  },
  {
    id: 'kyzylorda',
    name: 'Кызылординская область',
    shortName: 'КЫЗ',
    path: 'M360 354 L420 332 L452 368 L420 404 L362 402 L336 372 Z',
    labelPosition: { x: 396, y: 368 },
    stats: {
      projects: { total: 398, grants: 138, programs: 104, contracts: 78, commercialization: 78, avgDuration: 22 },
      publications: { total: 670, journals: 230, conferences: 160, books: 82, other: 198 },
      people: { total: 1980, docents: 470, professors: 210, associateProfessors: 150, avgAge: 44 },
      finances: { total: 39, lastYear: 12.8, avgExpense: 284, budgetUsage: 89, regionalPrograms: 12 },
    },
  },
  {
    id: 'ulytau',
    name: 'Улытауская область',
    shortName: 'УЛЫ',
    path: 'M326 320 L388 302 L420 332 L392 364 L336 354 L310 332 Z',
    labelPosition: { x: 366, y: 332 },
    stats: {
      projects: { total: 285, grants: 98, programs: 76, contracts: 58, commercialization: 53, avgDuration: 20 },
      publications: { total: 520, journals: 180, conferences: 120, books: 60, other: 160 },
      people: { total: 1680, docents: 380, professors: 170, associateProfessors: 120, avgAge: 45 },
      finances: { total: 33, lastYear: 10.9, avgExpense: 276, budgetUsage: 87, regionalPrograms: 10 },
    },
  },
  {
    id: 'karaganda',
    name: 'Карагандинская область',
    shortName: 'КАР',
    path: 'M344 264 L420 240 L470 272 L450 326 L372 330 L330 300 Z',
    labelPosition: { x: 400, y: 286 },
    stats: {
      projects: { total: 690, grants: 240, programs: 200, contracts: 150, commercialization: 100, avgDuration: 26 },
      publications: { total: 1180, journals: 400, conferences: 270, books: 150, other: 360 },
      people: { total: 3480, docents: 820, professors: 380, associateProfessors: 280, avgAge: 44 },
      finances: { total: 78, lastYear: 26, avgExpense: 350, budgetUsage: 90, regionalPrograms: 26 },
    },
  },
  {
    id: 'astana',
    name: 'Город Астана',
    shortName: 'АСТ',
    path: 'M466 298 L488 292 L504 312 L480 324 L462 312 Z',
    labelPosition: { x: 482, y: 312 },
    stats: {
      projects: { total: 520, grants: 190, programs: 150, contracts: 110, commercialization: 70, avgDuration: 24 },
      publications: { total: 960, journals: 340, conferences: 230, books: 120, other: 270 },
      people: { total: 2980, docents: 660, professors: 320, associateProfessors: 220, avgAge: 41 },
      finances: { total: 82, lastYear: 28.4, avgExpense: 368, budgetUsage: 94, regionalPrograms: 28 },
    },
  },
  {
    id: 'almaty-city',
    name: 'Город Алматы',
    shortName: 'АЛМГ',
    path: 'M592 436 L612 430 L626 452 L602 464 L586 446 Z',
    labelPosition: { x: 606, y: 452 },
    stats: {
      projects: { total: 640, grants: 220, programs: 185, contracts: 140, commercialization: 95, avgDuration: 25 },
      publications: { total: 1320, journals: 450, conferences: 310, books: 170, other: 390 },
      people: { total: 4120, docents: 920, professors: 460, associateProfessors: 340, avgAge: 40 },
      finances: { total: 96, lastYear: 32, avgExpense: 382, budgetUsage: 95, regionalPrograms: 32 },
    },
  },
  {
    id: 'shymkent',
    name: 'Город Шымкент',
    shortName: 'ШЫМ',
    path: 'M448 420 L480 412 L498 442 L466 462 L440 446 Z',
    labelPosition: { x: 468, y: 444 },
    stats: {
      projects: { total: 520, grants: 185, programs: 165, contracts: 110, commercialization: 60, avgDuration: 23 },
      publications: { total: 960, journals: 330, conferences: 240, books: 120, other: 270 },
      people: { total: 2840, docents: 640, professors: 310, associateProfessors: 220, avgAge: 42 },
      finances: { total: 68, lastYear: 22.4, avgExpense: 320, budgetUsage: 91, regionalPrograms: 21 },
    },
  },
];
