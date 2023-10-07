from CTFd.constants import RawEnum


class Languages(str, RawEnum):
    ENGLISH = "en"
    GERMAN = "de"
    POLISH = "pl"
    SPANISH = "es"
    CHINESE = "zh"
    RUSSIAN = "ru"


LANGUAGE_NAMES = {
    "en": "English",
    "de": "Deutsch",
    "pl": "Polski",
    "es": "Español",
    "zh": "中文",
    "ru": "Русский",
}

SELECT_LANGUAGE_LIST = [("", "")] + [
    (str(lang), LANGUAGE_NAMES.get(str(lang))) for lang in Languages
]
