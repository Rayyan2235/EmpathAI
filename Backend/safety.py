



def check_red_flags(text:str) -> bool:
    red_flags = ["suicide", "kill", "die", "death", "suicidal", "suicide attempt", "suicide ideation", "suicide risk", "suicide watch", "suicide attempt", "suicide ideation", "suicide risk", "suicide watch", "kill myself", "suicide", "want to die", "end my life", "no reason to live",
    "disappear forever", "hurt myself", "jump off", "cut myself"]

    for flag in red_flags:
        if flag in text.lower():
            return True
    return False


