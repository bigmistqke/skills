# Does the sentence hold?

Your batch file has six sentences. Under each sentence are six timelines, each named in bold (such as **U1-never**). A timeline lists, moment by moment, which of two facts are true. A fact can be true at one moment, false at the next, and true again later, exactly as the table says, even where its words ("has run", "has disposed") sound like they could not change back.

For each timeline, say whether the sentence is true of it, now (the moment the sentence's heading names). Read the sentence exactly as written: it says no more and no less than its words.

Write your answers to `answers-K.json` in this folder, where K is your batch number, as a JSON array: [{"q": "U1-never", "holds": true, "why": "a few words"}], one entry per timeline (36 in all). Then add one entry per sentence: {"q": "U1-hard", "hard": 1-5}, where 1 is easy to read and 5 is very hard. Read only `brief.md` and your own batch file. Do not read any other file.
