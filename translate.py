#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os

# Translations dictionary
translations = {
    # Tab names
    "'СЃРёРїС‹ РҐРѕР»РѕРґРєР°'": "'РЎРЁРџ РҐРѕР»РѕРґРЅР°СЏ РєР°РјРµСЂР°'",
    "'СЃРёРїС‹ Р"РѕСЃРё'": "'РЎРЁРџ РҐРѕР·СЏР№СЃС‚РІР°'",
    "'Р—Р°РєСЂС‹РІ'": "'Р—Р°РєСЂС‹С‚Рѕ'",
    
    # Common buttons and labels
    "placeholder='РќР°Р·РІР°...'": "placeholder='РќР°Р·РІР°РЅРёРµ...'",
    "placeholder='РџРѕС€СЃРєСѓРї...'": "placeholder='РџРѕС‚РѕРєС...'",
    "'Р"РѕРґР°РІС‚Рµ'": "'Р"РѕР±Р°РІС‰С‚Рµ'",
    "'РќРё'": "'РќР°РјРјДЉСЃ'",
    "'Р'РёРґР°Р»РёС‚Рё'": "'РЈРґР°Р»РёС‚С‚Рѕ'",
    "'Р"РѕРІСЃ'": "'Р"РѕСЃС'",
    "'РќС‹РІС…'": "'РќРѕРІРѕРµ'",
    "'РЕС‡РёСЃС‚РёС‚Рё'": "'РћС‡РёСЃС‚РёС‚Рѕ'",
    
    # Settings/themes
    "'РўСЊРјСЏРЅР°'": "'РўРµРјРЅР°СЏ'",
    "'Р§РѕСЂРЅР°'": "'РЋРЊР´вђќРєР°'",
    "'Р–РѕРІС‚Р°'": "'СЃРІРµС‚Р»Р°СЏ'",
    "'Р'РёР»Р°'": "'Р'РѕР»СЊС€Р°СЏ'",
    
    # Status messages
    "'Р—Р°РєСЂС‹С‚Рѕ'": "'РЂСЃХе†РЎС‚ёРѕР·'",
    "'РђР±Р»РёР±Рѕ'": "'РђС—РѕР»СѓС‚Рѕ'",
    "'РћС€РёР±РєР°'": "'РћС'РёР±РєР°'",
    "'РЛГјСЃС"': "'РЛГјСЃС''",
}

files_to_translate = [
    'c:\\Users\\gozit\\Desktop\\project\\Sip\\script.js',
    'c:\\Users\\gozit\\Desktop\\project\\Sip\\index.html'
]

for file_path in files_to_translate:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old, new in translations.items():
            content = content.replace(old, new)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Translated: {file_path}")
    else:
        print(f"File not found: {file_path}")

print("Translation complete!")
