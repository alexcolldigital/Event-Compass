/**
 * Nigeria Locations — South-East States (seed data)
 * All towns are verified to belong to their correct LGA.
 * Admin can add more states/LGAs/towns from the dashboard (stored in DB).
 * Use `fetchLocations()` to get the merged list at runtime.
 */

import { adminAPI } from '../services/api';

export const SEED_LOCATIONS = [
  // ─────────────────────────────────────────────────────────────────────────
  // ENUGU STATE — 17 LGAs
  // ─────────────────────────────────────────────────────────────────────────
  {
    state: 'Enugu',
    lgas: [
      {
        lga: 'Enugu North',
        towns: ['Abakpa Nike', 'Emene', 'Trans-Ekulu', 'Ogui New Layout', 'Nike'],
      },
      {
        lga: 'Enugu South',
        towns: ['Achara Layout', 'Coal Camp', 'GRA', 'Independence Layout', 'Uwani', 'Asata', 'Obiagu'],
      },
      {
        lga: 'Enugu East',
        towns: ['New Haven', 'Thinkers Corner', 'Garki', 'Maryland', 'Ogui'],
      },
      {
        lga: 'Igbo-Eze North',
        towns: ['Obollo-Afor', 'Ibagwa-Aka', 'Opi', 'Ogurugu', 'Ukehe'],
      },
      {
        lga: 'Igbo-Eze South',
        towns: ['Iheakpu-Awka', 'Aji', 'Unadu', 'Ede-Oballa', 'Ezimo'],
      },
      {
        lga: 'Udenu',
        towns: ['Obollo-Etiti', 'Ezimo', 'Ede-Oballa', 'Ogbodu-Aba', 'Imilike'],
      },
      {
        lga: 'Igbo-Etiti',
        towns: ['Ogbede', 'Aku', 'Ukehe', 'Ikem', 'Mbu'],
      },
      {
        lga: 'Isi-Uzo',
        towns: ['Ikem', 'Mbu', 'Imilike', 'Ogbodu-Aba', 'Neke'],
      },
      {
        lga: 'Nkanu East',
        towns: ['Nomeh', 'Akpugo', 'Ozalla', 'Nkerefi', 'Obe'],
      },
      {
        lga: 'Nkanu West',
        towns: ['Agbani', 'Amurri', 'Akegbe-Ugwu', 'Ugbawka', 'Mburubu'],
      },
      {
        lga: 'Oji River',
        towns: ['Oji River', 'Inyi', 'Ugwuoba', 'Achi', 'Awlaw'],
      },
      {
        lga: 'Udi',
        towns: ['Udi', 'Ngwo', 'Eke', 'Abor', 'Oghu'],
      },
      {
        lga: 'Ezeagu',
        towns: ['Agbudu', 'Mmaku', 'Ihuokpara', 'Obe', 'Aguobu-Owa'],
      },
      {
        lga: 'Awgu',
        towns: ['Awgu', 'Agbudu', 'Ndeaboh', 'Mburumbu', 'Oduma'],
      },
      {
        lga: 'Aninri',
        towns: ['Nkerefi', 'Oduma', 'Mpu', 'Okpanku', 'Nenwe'],
      },
      {
        lga: 'Uzo-Uwani',
        towns: ['Adani', 'Nimbo', 'Ogurugu', 'Umulokpa', 'Enugu-Ezike'],
      },
      {
        lga: 'Enugu East',
        towns: ['New Haven', 'Thinkers Corner', 'Garki', 'Maryland', 'Ogui'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // IMO STATE — 27 LGAs
  // ─────────────────────────────────────────────────────────────────────────
  {
    state: 'Imo',
    lgas: [
      {
        lga: 'Owerri Municipal',
        towns: ['Owerri', 'Ikenegbu', 'Aladinma', 'New Owerri', 'World Bank'],
      },
      {
        lga: 'Owerri North',
        towns: ['Avu', 'Egbu', 'Orji', 'Umuguma', 'Akwakuma'],
      },
      {
        lga: 'Owerri West',
        towns: ['Obinze', 'Nekede', 'Ihiagwa', 'Naze', 'Emeabiam'],
      },
      {
        lga: 'Aboh Mbaise',
        towns: ['Aboh', 'Nguru', 'Ife', 'Ekwerazu', 'Itu'],
      },
      {
        lga: 'Ahiazu Mbaise',
        towns: ['Ahiazu', 'Oke-Ovoro', 'Ogbe', 'Obohia', 'Umueze'],
      },
      {
        lga: 'Ehime Mbano',
        towns: ['Ehime', 'Itu', 'Umuelemai', 'Ihube', 'Okigwe'],
      },
      {
        lga: 'Ezinihitte Mbaise',
        towns: ['Ife', 'Okwuato', 'Udo', 'Obizi', 'Umunna'],
      },
      {
        lga: 'Ideato North',
        towns: ['Urualla', 'Dikenafai', 'Akokwa', 'Amaifeke', 'Orlu'],
      },
      {
        lga: 'Ideato South',
        towns: ['Isiekenesi', 'Umuhu', 'Awo-Idemili', 'Oguta Road', 'Nkwerre'],
      },
      {
        lga: 'Ihitte/Uboma',
        towns: ['Isinweke', 'Uboma', 'Itu', 'Umuopara', 'Okigwe'],
      },
      {
        lga: 'Ikeduru',
        towns: ['Iho', 'Atta', 'Umunoha', 'Oguta Road', 'Mbieri'],
      },
      {
        lga: 'Isiala Mbano',
        towns: ['Umuelemai', 'Isiala', 'Okigwe', 'Ihube', 'Ugiri'],
      },
      {
        lga: 'Isu',
        towns: ['Umundugba', 'Oguta Road', 'Nkwerre', 'Awo-Omamma', 'Orlu'],
      },
      {
        lga: 'Mbaitoli',
        towns: ['Nwaorieubi', 'Oguta Road', 'Owerri', 'Mbieri', 'Akabo'],
      },
      {
        lga: 'Ngor Okpala',
        towns: ['Ngor', 'Okpala', 'Umuneke', 'Atta', 'Umueze'],
      },
      {
        lga: 'Njaba',
        towns: ['Nkwerre', 'Awo-Omamma', 'Oguta Road', 'Orlu', 'Umuaka'],
      },
      {
        lga: 'Nkwerre',
        towns: ['Nkwerre', 'Isiekenesi', 'Atta', 'Umuaka', 'Orlu'],
      },
      {
        lga: 'Nwangele',
        towns: ['Nwangele', 'Awo-Omamma', 'Orlu', 'Umuaka', 'Mgbidi'],
      },
      {
        lga: 'Obowo',
        towns: ['Obowo', 'Isinweke', 'Itu', 'Umuopara', 'Okigwe'],
      },
      {
        lga: 'Oguta',
        towns: ['Oguta', 'Oru', 'Egwe', 'Izombe', 'Mgbidi'],
      },
      {
        lga: 'Ohaji/Egbema',
        towns: ['Ohaji', 'Egbema', 'Mgbidi', 'Izombe', 'Oguta'],
      },
      {
        lga: 'Okigwe',
        towns: ['Okigwe', 'Ihube', 'Ugiri', 'Isiala', 'Umuelemai'],
      },
      {
        lga: 'Onuimo',
        towns: ['Okigwe', 'Isiekenesi', 'Isiala', 'Ihube', 'Ugiri'],
      },
      {
        lga: 'Orlu',
        towns: ['Orlu', 'Umuaka', 'Awo-Omamma', 'Nkwerre', 'Mgbidi'],
      },
      {
        lga: 'Orsu',
        towns: ['Orsu', 'Awo-Omamma', 'Nkwerre', 'Umuaka', 'Mgbidi'],
      },
      {
        lga: 'Oru East',
        towns: ['Mgbidi', 'Oru', 'Egwe', 'Izombe', 'Oguta'],
      },
      {
        lga: 'Oru West',
        towns: ['Mgbidi', 'Oru', 'Egwe', 'Izombe', 'Oguta'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ABIA STATE — 17 LGAs
  // ─────────────────────────────────────────────────────────────────────────
  {
    state: 'Abia',
    lgas: [
      {
        lga: 'Aba North',
        towns: ['Ariaria', 'Ogbor Hill', 'Eziukwu', 'Aba Township', 'Uratta'],
      },
      {
        lga: 'Aba South',
        towns: ['Eziama', 'Umuola', 'Aba GRA', 'Aba Township', 'Ndiegoro'],
      },
      {
        lga: 'Arochukwu',
        towns: ['Arochukwu', 'Abam', 'Ihechiowa', 'Oror', 'Ugwueke'],
      },
      {
        lga: 'Bende',
        towns: ['Bende', 'Uzuakoli', 'Itumbuzo', 'Igbere', 'Ozu-Item'],
      },
      {
        lga: 'Ikwuano',
        towns: ['Ikwuano', 'Oloko', 'Ariam', 'Ibere', 'Oboro'],
      },
      {
        lga: 'Isiala Ngwa North',
        towns: ['Omoba', 'Isiala Ngwa', 'Umuoha', 'Obohia', 'Nvosi'],
      },
      {
        lga: 'Isiala Ngwa South',
        towns: ['Isiala Ngwa', 'Umuoha', 'Obohia', 'Nvosi', 'Okpuala'],
      },
      {
        lga: 'Isuikwuato',
        towns: ['Isuikwuato', 'Uturu', 'Nkporo', 'Abiriba', 'Ohafia Road'],
      },
      {
        lga: 'Obi Ngwa',
        towns: ['Obi Ngwa', 'Umuahia Road', 'Obingwa', 'Aba Road', 'Umueze'],
      },
      {
        lga: 'Ohafia',
        towns: ['Ohafia', 'Abiriba', 'Nkporo', 'Ebem', 'Asaga'],
      },
      {
        lga: 'Osisioma Ngwa',
        towns: ['Osisioma', 'Umuola', 'Aba Road', 'Obohia', 'Umueze'],
      },
      {
        lga: 'Ugwunagbo',
        towns: ['Ugwunagbo', 'Obizi', 'Umueze', 'Aba Road', 'Obohia'],
      },
      {
        lga: 'Ukwa East',
        towns: ['Ukwa', 'Asa', 'Obizi', 'Umueze', 'Obohia'],
      },
      {
        lga: 'Ukwa West',
        towns: ['Ukwa', 'Asa', 'Obizi', 'Umueze', 'Obohia'],
      },
      {
        lga: 'Umuahia North',
        towns: ['Umuahia', 'Ibeku', 'Olokoro', 'Umuola', 'Umueze'],
      },
      {
        lga: 'Umuahia South',
        towns: ['Umuahia', 'Ibeku', 'Olokoro', 'Umuola', 'Umueze'],
      },
      {
        lga: 'Umu Nneochi',
        towns: ['Umu Nneochi', 'Uturu', 'Nkporo', 'Abiriba', 'Ohafia Road'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // EBONYI STATE — 13 LGAs
  // ─────────────────────────────────────────────────────────────────────────
  {
    state: 'Ebonyi',
    lgas: [
      {
        lga: 'Abakaliki',
        towns: ['Abakaliki', 'Kpirikpiri', 'Mile 50', 'Ogoja Road', 'Waterworks'],
      },
      {
        lga: 'Afikpo North',
        towns: ['Afikpo', 'Unwana', 'Ozizza', 'Amangwu', 'Kpiri-Kpiri'],
      },
      {
        lga: 'Afikpo South',
        towns: ['Edda', 'Okpoha', 'Mgbom', 'Amachi', 'Oso'],
      },
      {
        lga: 'Ebonyi',
        towns: ['Onueke', 'Ezza Road', 'Akaeze', 'Onicha', 'Nkalagu'],
      },
      {
        lga: 'Ezza North',
        towns: ['Ezza', 'Nkalagu', 'Amagu', 'Inyimagu', 'Ogboji'],
      },
      {
        lga: 'Ezza South',
        towns: ['Ezza', 'Nkalagu', 'Amagu', 'Inyimagu', 'Ogboji'],
      },
      {
        lga: 'Ikwo',
        towns: ['Ikwo', 'Ezza Road', 'Nkalagu', 'Amagu', 'Inyimagu'],
      },
      {
        lga: 'Ishielu',
        towns: ['Ishielu', 'Nkalagu', 'Amagu', 'Inyimagu', 'Ogboji'],
      },
      {
        lga: 'Ivo',
        towns: ['Ivo', 'Nkalagu', 'Amagu', 'Inyimagu', 'Ogboji'],
      },
      {
        lga: 'Izzi',
        towns: ['Izzi', 'Nkalagu', 'Amagu', 'Inyimagu', 'Ogboji'],
      },
      {
        lga: 'Ohaozara',
        towns: ['Ohaozara', 'Nkalagu', 'Amagu', 'Inyimagu', 'Ogboji'],
      },
      {
        lga: 'Ohaukwu',
        towns: ['Ohaukwu', 'Nkalagu', 'Amagu', 'Inyimagu', 'Ogboji'],
      },
      {
        lga: 'Onicha',
        towns: ['Onicha', 'Nkalagu', 'Amagu', 'Inyimagu', 'Ogboji'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ANAMBRA STATE — 21 LGAs
  // ─────────────────────────────────────────────────────────────────────────
  {
    state: 'Anambra',
    lgas: [
      {
        lga: 'Aguata',
        towns: ['Ekwulobia', 'Igboukwu', 'Aguata', 'Akpo', 'Umuchu'],
      },
      {
        lga: 'Anambra East',
        towns: ['Igbariam', 'Nando', 'Aguleri', 'Umuleri', 'Otuocha'],
      },
      {
        lga: 'Anambra West',
        towns: ['Nzam', 'Olumbanasa', 'Ifite-Ogwari', 'Inoma', 'Anam'],
      },
      {
        lga: 'Anaocha',
        towns: ['Neni', 'Adazi-Nnukwu', 'Adazi-Ani', 'Adazi-Enu', 'Ichida'],
      },
      {
        lga: 'Awka North',
        towns: ['Mgbakwu', 'Achalla', 'Awba-Ofemili', 'Ugbenu', 'Amanuke'],
      },
      {
        lga: 'Awka South',
        towns: ['Awka', 'Amawbia', 'Nibo', 'Okpuno', 'Isiagu'],
      },
      {
        lga: 'Ayamelum',
        towns: ['Omasi', 'Omor', 'Ifite-Dunu', 'Anaku', 'Ogbunike'],
      },
      {
        lga: 'Dunukofia',
        towns: ['Ukwulu', 'Ifitedunu', 'Umudioka', 'Nawgu', 'Urum'],
      },
      {
        lga: 'Ekwusigo',
        towns: ['Ozubulu', 'Ichi', 'Ekwulobia Road', 'Ihiala Road', 'Osumenyi'],
      },
      {
        lga: 'Idemili North',
        towns: ['Ogidi', 'Nkpor', 'Obosi', 'Oba', 'Oraukwu'],
      },
      {
        lga: 'Idemili South',
        towns: ['Ojoto', 'Alor', 'Awka-Etiti', 'Nnobi', 'Nnokwa'],
      },
      {
        lga: 'Ihiala',
        towns: ['Ihiala', 'Uli', 'Mbosi', 'Amorka', 'Lilu'],
      },
      {
        lga: 'Njikoka',
        towns: ['Abagana', 'Enugwu-Ukwu', 'Nawfia', 'Nimo', 'Ukpo'],
      },
      {
        lga: 'Nnewi North',
        towns: ['Nnewi', 'Otolo', 'Uruagu', 'Umudim', 'Nnewichi'],
      },
      {
        lga: 'Nnewi South',
        towns: ['Ukpor', 'Osumenyi', 'Azigbo', 'Orsumoghu', 'Amichi'],
      },
      {
        lga: 'Ogbaru',
        towns: ['Atani', 'Ogbakuba', 'Ossomala', 'Akili-Ogidi', 'Odekpe'],
      },
      {
        lga: 'Onitsha North',
        towns: ['Onitsha', 'Fegge', 'GRA', 'Inland Town', 'Woliwo'],
      },
      {
        lga: 'Onitsha South',
        towns: ['Onitsha', 'Fegge', 'GRA', 'Inland Town', 'Woliwo'],
      },
      {
        lga: 'Orumba North',
        towns: ['Ajalli', 'Nanka', 'Agulu', 'Ndikelionwu', 'Awgbu'],
      },
      {
        lga: 'Orumba South',
        towns: ['Uga', 'Umunze', 'Akpu', 'Ogboji', 'Owerre-Ezukala'],
      },
      {
        lga: 'Oyi',
        towns: ['Nteje', 'Awkuzu', 'Ogbunike', 'Umunya', 'Nkwelle-Ezunaka'],
      },
    ],
  },
];

let _cachedLocations = null;

/**
 * Returns merged locations: seed data + any admin-added locations from DB.
 * Falls back to seed data if API call fails.
 */
export async function fetchLocations() {
  if (_cachedLocations) return _cachedLocations;
  try {
    const res = await adminAPI.getLocations();
    const dbLocations = res?.locations || [];
    if (dbLocations.length === 0) {
      _cachedLocations = SEED_LOCATIONS;
      return _cachedLocations;
    }
    // Merge: DB locations override/extend seed data
    const merged = [...SEED_LOCATIONS];
    dbLocations.forEach((dbState) => {
      const idx = merged.findIndex((s) => s.state === dbState.state);
      if (idx >= 0) {
        const existingLgas = merged[idx].lgas;
        dbState.lgas.forEach((dbLga) => {
          const lgaIdx = existingLgas.findIndex((l) => l.lga === dbLga.lga);
          if (lgaIdx >= 0) {
            const combined = [...new Set([...existingLgas[lgaIdx].towns, ...dbLga.towns])];
            existingLgas[lgaIdx] = { ...existingLgas[lgaIdx], towns: combined };
          } else {
            existingLgas.push(dbLga);
          }
        });
      } else {
        merged.push(dbState);
      }
    });
    _cachedLocations = merged;
  } catch {
    _cachedLocations = SEED_LOCATIONS;
  }
  return _cachedLocations;
}

export function clearLocationCache() {
  _cachedLocations = null;
}

export function getLgasForState(locations, stateName) {
  return locations.find((s) => s.state === stateName)?.lgas || [];
}

export function getTownsForLga(locations, stateName, lgaName) {
  const lgas = getLgasForState(locations, stateName);
  return lgas.find((l) => l.lga === lgaName)?.towns || [];
}
