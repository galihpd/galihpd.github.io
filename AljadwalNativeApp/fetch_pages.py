import urllib.request, json
try:
    print('Fetching whole Quran...')
    url = 'http://api.alquran.cloud/v1/quran/en.asad'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        surahs = data['data']['surahs']
        
        page_dict = {}
        for s in surahs:
            s_name = s['englishName']
            for a in s['ayahs']:
                page = a['page']
                a_num = a['numberInSurah']
                if page not in page_dict:
                    page_dict[page] = []
                page_dict[page].append((s_name, a_num))
        
        pages = []
        for p in range(1, 605):
            if p in page_dict:
                ayahs = page_dict[p]
                surah_names = []
                ayah_ranges = []
                current_surah = None
                start_ayah = None
                last_ayah = None
                for (s_name, a_num) in ayahs:
                    if s_name != current_surah:
                        if current_surah is not None:
                            surah_names.append(current_surah)
                            if start_ayah == last_ayah:
                                ayah_ranges.append(f'{start_ayah}')
                            else:
                                ayah_ranges.append(f'{start_ayah}-{last_ayah}')
                        current_surah = s_name
                        start_ayah = a_num
                    last_ayah = a_num
                surah_names.append(current_surah)
                if start_ayah == last_ayah:
                    ayah_ranges.append(f'{start_ayah}')
                else:
                    ayah_ranges.append(f'{start_ayah}-{last_ayah}')
                
                if len(surah_names) == 1:
                    title = f'{surah_names[0]} {ayah_ranges[0]}'
                else:
                    title = ' | '.join([f'{s} {r}' for s, r in zip(surah_names, ayah_ranges)])
                pages.append(f'    {p} to "{title}"')
            else:
                pages.append(f'    {p} to "Unknown"')
                
        kt_code = """package com.example.aljadwal.data.model

object PageInfo {
    val pageMapping = mapOf<Int, String>(
""" + ',\n'.join(pages) + """
    )
}
"""
        with open('app/src/main/java/com/example/aljadwal/data/model/PageInfo.kt', 'w', encoding='utf-8') as f:
            f.write(kt_code)
        print('Success')
except Exception as e:
    print('Error:', e)
