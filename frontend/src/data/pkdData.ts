export interface PKDEntry {
  pkd: string;
  description: string;
  machineUse: boolean;
}

export const pkdData: PKDEntry[] = [
  { pkd: "13.92.Z", description: "Produkcja gotowych wyrobów tekstylnych (w zakresie produkcji żagli)", machineUse: true },
  { pkd: "25.11.Z", description: "Produkcja konstrukcji metalowych i ich części", machineUse: true },
  { pkd: "25.29.Z", description: "Produkcja pozostałych zbiorników, cystern i pojemników metalowych", machineUse: true },
  { pkd: "25.60", description: "Obróbka metali i nakładanie powłok na metale", machineUse: true },
  { pkd: "25.61.Z", description: "Obróbka metali i nakładanie powłok na metale", machineUse: true },
  { pkd: "25.62.Z", description: "Obróbka mechaniczna elementów metalowych", machineUse: true },
  { pkd: "25.99.Z", description: "Produkcja pozostałych gotowych wyrobów metalowych", machineUse: true },
  { pkd: "26.11.Z", description: "Produkcja elementów elektronicznych", machineUse: true },
  { pkd: "26.12.Z", description: "Produkcja elektronicznych obwodów drukowanych", machineUse: true },
  { pkd: "26.20.Z", description: "Produkcja komputerów i urządzeń peryferyjnych", machineUse: true },
  { pkd: "26.30.Z", description: "Produkcja telefonów i urządzeń transmisyjnych", machineUse: true },
  { pkd: "26.40.Z", description: "Produkcja elektronicznego sprzętu powszechnego użytku", machineUse: true },
  { pkd: "26.51.Z", description: "Produkcja instrumentów i przyrządów pomiarowych, kontrolnych i nawigacyjnych", machineUse: true },
  { pkd: "26.52.Z", description: "Produkcja zegarków i zegarów", machineUse: true },
  { pkd: "26.60.Z", description: "Produkcja urządzeń napromieniowujących, sprzętu elektromedycznego", machineUse: true },
  { pkd: "26.70.Z", description: "Produkcja instrumentów optycznych i sprzętu fotograficznego", machineUse: true },
  { pkd: "26.80.Z", description: "Produkcja magnetycznych i optycznych nośników informacji", machineUse: true },
  { pkd: "27.40.Z", description: "Produkcja elektrycznego sprzętu oświetleniowego", machineUse: true },
  { pkd: "27.51", description: "Produkcja elektrycznego sprzętu gospodarstwa domowego", machineUse: true },
  { pkd: "28.11.Z", description: "Produkcja silników i turbin", machineUse: true },
  { pkd: "28.29.Z", description: "Produkcja pozostałych maszyn ogólnego przeznaczenia", machineUse: true },
  { pkd: "30.30.Z", description: "Produkcja statków powietrznych, statków kosmicznych", machineUse: true },
  { pkd: "30.91.Z", description: "Produkcja motocykli", machineUse: true },
  { pkd: "33.11.Z", description: "Naprawa i konserwacja metalowych wyrobów gotowych", machineUse: true },
  { pkd: "33.12.Z", description: "Naprawa i konserwacja maszyn", machineUse: true },
  { pkd: "33.14.Z", description: "Naprawa i konserwacja urządzeń elektrycznych", machineUse: true },
  { pkd: "33.15.Z", description: "Naprawa i konserwacja statków i łodzi", machineUse: true },
  { pkd: "33.16.Z", description: "Naprawa i konserwacja statków powietrznych", machineUse: true },
  { pkd: "33.17.Z", description: "Naprawa i konserwacja pozostałego sprzętu transportowego", machineUse: true },
  { pkd: "33.19.Z", description: "Naprawa i konserwacja pozostałego sprzętu wyposażenia", machineUse: true },
  { pkd: "33.20.Z", description: "Instalowanie maszyn przemysłowych, sprzętu i wyposażenia", machineUse: true },
  { pkd: "43.21.Z", description: "Wykonywanie instalacji elektrycznych", machineUse: false },
  { pkd: "43.22.Z", description: "Wykonywanie instalacji wodno-kanalizacyjnych, cieplnych, gazowych", machineUse: false },
  { pkd: "46.19.Z", description: "Działalność agentów zajmujących się sprzedażą towarów", machineUse: false },
  { pkd: "47.73.Z", description: "Sprzedaż detaliczna wyrobów farmaceutycznych", machineUse: false },
  { pkd: "49.31.Z", description: "Transport lądowy pasażerski, miejski i podmiejski", machineUse: false },
  { pkd: "49.32.Z", description: "Działalność taksówek osobowych", machineUse: true },
  { pkd: "49.39.Z", description: "Pozostały transport lądowy pasażerski", machineUse: false },
  { pkd: "49.41.Z", description: "Transport drogowy towarów", machineUse: false },
  { pkd: "51.22.Z", description: "Transport kosmiczny", machineUse: false },
  { pkd: "52.21.Z", description: "Działalność usługowa wspomagająca transport lądowy", machineUse: true },
  { pkd: "53.20.Z", description: "Pozostała działalność pocztowa i kurierska", machineUse: true },
  { pkd: "58.21.Z", description: "Działalność wydawnicza w zakresie gier komputerowych", machineUse: false },
  { pkd: "61.30.Z", description: "Działalność w zakresie telekomunikacji satelitarnej", machineUse: false },
  { pkd: "61.90.Z", description: "Działalność w zakresie pozostałej telekomunikacji", machineUse: true },
  { pkd: "62.01.Z", description: "Działalność związana z oprogramowaniem", machineUse: true },
  { pkd: "62.02.Z", description: "Działalność związana z doradztwem w zakresie informatyki", machineUse: false },
  { pkd: "63.11.Z", description: "Przetwarzanie danych", machineUse: true },
  { pkd: "63.12.Z", description: "Działalność portali internetowych", machineUse: false },
  { pkd: "68.20.Z", description: "Wynajem i zarządzanie nieruchomościami", machineUse: false },
  { pkd: "71.11.Z", description: "Działalność w zakresie architektury", machineUse: false },
  { pkd: "72.19.Z", description: "Badania naukowe i prace rozwojowe w dziedzinie nauk przyrodniczych", machineUse: false },
  { pkd: "74.10.Z", description: "Działalność w zakresie specjalistycznego projektowania", machineUse: false },
  { pkd: "74.90.Z", description: "Pozostała działalność profesjonalna, naukowa i techniczna", machineUse: false },
  { pkd: "85.60.Z", description: "Działalność wspomagająca edukację", machineUse: false },
  { pkd: "86.10.Z", description: "Działalność szpitali", machineUse: false },
  { pkd: "86.21.Z", description: "Praktyka lekarska ogólna", machineUse: false },
  { pkd: "86.22.Z", description: "Praktyka lekarska specjalistyczna", machineUse: true },
  { pkd: "87.20.Z", description: "Pomoc społeczna z zakwaterowaniem", machineUse: false },
  { pkd: "96.02.Z", description: "Fryzjerstwo i pozostałe zabiegi kosmetyczne", machineUse: false },
  { pkd: "96.04.Z", description: "Działalność usługowa związana z poprawą kondycji fizycznej", machineUse: false },
  { pkd: "96.09.Z", description: "Pozostała działalność usługowa (salony tatuażu i piercingu)", machineUse: true },
];

export function getRandomMachineUsePKD(): PKDEntry {
  const machineUsePKDs = pkdData.filter(entry => entry.machineUse);
  return machineUsePKDs[Math.floor(Math.random() * machineUsePKDs.length)];
}

export function getPKDByCode(code: string): PKDEntry | undefined {
  return pkdData.find(entry => entry.pkd === code);
}
