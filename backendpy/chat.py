import random
import json
import re
from nltk_utils import tokenize
from datetime import datetime, timedelta
from fuzzywuzzy import fuzz

# with open('intents.json', 'r') as json_data:
#     intents = json.load(json_data)

days_mapping = {'monday': 0, 'tuesday': 1, 'wednesday': 2, 'thursday': 3, 'friday': 4, 'saturday': 5, 'sunday': 6}
print(fuzz.ratio('hey','heii'))

def get_upcoming_day(day):
    today = datetime.now().date()
    days_until_specified_day = (days_mapping[day] - today.weekday() + 7) % 7
    upcoming_day_date = today + timedelta(days=days_until_specified_day)
    return f"{upcoming_day_date}"

def convert_to_date(date_str):
    return datetime.strptime(date_str, '%d-%m-%Y')


numeric_words = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"]
def count_numeric_words(input_string_lower):
    count = 0
    i=0
    while(i<len(numeric_words)):
        if(input_string_lower == numeric_words[i]):
            count += (i+1)
        i+=1

    return count

def AskQuestion(sentence):
    roomAmenities=['ac','tv','beverages','wifi','breakfast','minibar','newspaper','jacuzzi','smart']
    roomTypes=['business','junior','presidential','suite','superior']
    hotelAmenities=['pool','hill','beach','gym','bar','parking']
    location=['coimbatore','chennai']
    cancel_keywords = ["cancel", "cancelling", "cancelation", "cancellation", "abort", "revoke"]
    print(sentence)
    sentence = tokenize(sentence.lower())
    tag=None
    print(datetime.now())
    response={
        'greeting': [
        "Hello! I'm here to assist you with your hotel booking. Let's begin by sharing your preferred hotel location. 😊",
        "Hi there! Ready to help you with your hotel reservation. To start, please let me know your preferred hotel location. 🌍",
        "Greetings! I'm your hotel booking assistant. To get started, tell me your preferred location, and we'll find the perfect spot for you. 🏨",
        "Hey! Excited to help you book a hotel. Can you kick things off by sharing your preferred location? Let's make it just right for you! 👍"
      ],
      'thanks':[
        "Thank you for choosing our services! If you have any more questions or need further assistance, feel free to ask. Safe travels! 🌟",
        "Thanks for considering us! Should you require any more help or information, don't hesitate to reach out. Wishing you a fantastic stay! 🙌",
        "Appreciate your trust in us! If there's anything else you need or want to know, we're just a message away. Have a wonderful day! 🌈",
        "A big thank you for choosing us! Any other requests or inquiries? We're here to make your experience exceptional. 🌟"
      ],
     'cancel': [
        "You've requested a cancellation. Are you sure that you want to cancel your previous booking?",
        "Sure, you want to cancel the booking. Are you sure about this?",
        "Canceling a booking? Just making sure it's what you want. Confirm if you're sure.",
      ],
    }
    i=0
    # print(sentence)
    n=len(sentence)
    pattern_str =r'(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|[12]\d|3[01])[-/.](\d{4})'
    while(i<n):
        word=sentence[i]
        greetings = ["hi", "hey", "hello", "morning", "evening","afternoon",'hei']
        match_threshold = 80
        # print(word)
        # if(word in ["hi", "hey", "hello", "morning","evening"]):
        #     tag='greeting'
        #     break;
        if any(fuzz.ratio(word.lower(), greeting.lower()) >= match_threshold for greeting in greetings):
            tag = 'greeting'
            break
        
        elif any(word.lower() in cancel_keywords for word in sentence):
            tag = 'cancel'
            break

        
        elif(word in ["thanks", "thank","bye"]):
            tag='thanks'
            break
        elif(word in ['days','nights','week','month','day']):
            tag="duration"
            break
        elif(word in [
        "adult","adults","child","children","son","sons","daughter","daughters","friends","friend","wife","husband","father","mother","mom","dad",
        "girlfriend","boyfriend","family","members","member","me","couple",
        "my","group","brother","sister","cousine","partner","people","peoples",
        "reservation","reservations"]):
            tag='people'
            break
        elif(word in [
        "provide","different","categories","about","availablity","informations","facilities",
        "amenities","included","standard","options","type","configurations","available","request","about",
        "business","junior","presidential","swimming","pool","hill","beach","gym","bar","parking",
        "ac","tv","beverages","wifi","breakfast","minibar","newspaper","jacuzzi","smart","business","junior","presidential",
        "balcony","pet","pets","about","get","difference","between"
      ]):
            tag='roomsDetail'
            break    
        elif(word in ["coimbatore","chennai","place","location","locations","places","at"]):
            tag='location'
            break
        elif(word in ["on","date","time","slot","weekend","month","day","week","night","morning","at","monday","tuesday","wednesday","thrusday","friday","saturday","sunday"] or re.match(pattern_str,word)):
            tag='date'
            break
        elif(word in ["high","low","under","above","between","minimum" ,"maximum" ,"least" ,"min", "max" ,"most" ,"cheapest", "costliest" ,"price" ,"cost" ,"offer", "rupees", "cash","rate" ]):
            tag='price'
            break
        i+=1

    ans=''
    cash=0
    date=''
    roomAmenitiesToken=[]
    hotelAmenitiesToken=[]
    roomTypeToken=[]
    locationToken=''
    duration=1
    print(tag)

    if tag: 
        #if the tag are found
        i=0
        n=len(sentence)
        difference_word_found=False
        while i<n:
            word=sentence[i]
             # print(word)
            if(word in roomAmenities):
                roomAmenitiesToken.append(word)
            elif(word in hotelAmenities):
                hotelAmenitiesToken.append(word)
            elif(word in roomTypes):
                roomTypeToken.append(word)
            elif(word in location):
                locationToken=word
            elif re.match(pattern_str,word):
                date=word
            elif(word in days_mapping):
                date=get_upcoming_day(word)
            elif(word=="weekend"):
                date=get_upcoming_day("saturday")
            elif(word=="difference"):
                difference_word_found=True
            i+=1
        if(tag=='greeting'):
            ans=(f"{random.choice(response['greeting'])}")
        elif(tag=='thanks'):
            ans=(f"{random.choice(response['thanks'])}")
        elif(tag=='cancel'):
            ans=(f"{random.choice(response['cancel'])}")
        elif(tag=='roomsDetail'):  #the user can get the info from this tag my a single string
            if(len(roomTypeToken)==0 and len(roomAmenitiesToken)==0 and len(hotelAmenitiesToken)==0):
                for word in sentence:
                    if(word in ['facilities','amenities','facility','amenity']):
                        ans="We have the facilities like {}".format(", ".join(roomAmenities+hotelAmenities))
                        break
                    elif(word in  ['types','type']):
                        ans="We have the room like {}".format(", ".join(roomTypes))
                        break
                else:
                    ans+="We have rooms like {} with the facilities like {}".format(", ".join(roomTypes),", ".join(roomAmenities+hotelAmenities))
            elif(difference_word_found):
                if 'business' in roomTypeToken and 'junior' in roomTypeToken:
                    ans = "On comparing Business with Junior type rooms, the Junior has news papers and minibar. The Junior is costlier than Business."
                elif 'business' in roomTypeToken and 'presidential' in roomTypeToken:
                    ans = "On comparing Business with Presidential type rooms, the Presidential has smart rooms, jacuzzi, minibar, news papers. The Presidential is costlier than Business."
                elif 'business' in roomTypeToken and 'suite' in roomTypeToken:
                    ans = "On comparing Business with Suite type rooms, the Suite has jacuzzi, minibar, news papers. The Suite is costlier than Business."
                elif 'superior' in roomTypeToken and 'junior' in roomTypeToken:
                    ans = "On comparing Superior with Junior type rooms, the Junior has news papers and minibar. The Junior is costlier than Superior."
                elif 'superior' in roomTypeToken and 'presidential' in roomTypeToken:
                    ans = "On comparing Superior with Presidential type rooms, the Presidential has smart rooms, jacuzzi, minibar, news papers. The Presidential is costlier than Superior."
                elif 'superior' in roomTypeToken and 'suite' in roomTypeToken:
                    ans = "On comparing Superior with Suite type rooms, the Suite has jacuzzi, minibar, news papers. The Suite is costlier than Superior."
                elif 'presidential' in roomTypeToken and 'suite' in roomTypeToken:
                    ans = "On comparing Presidential with Suite type rooms, the Suite has minibar and news papers. The Suite is costlier than Presidential."
                elif 'junior' in roomTypeToken and 'presidential' in roomTypeToken:
                    ans = "On comparing Junior with Presidential type rooms, the Presidential has smart rooms, minibar, and news papers. The Presidential is costlier than Junior."
                elif 'junior' in roomTypeToken and 'suite' in roomTypeToken:
                    ans = "On comparing Junior with Suite type rooms, the Suite has minibar and news papers. The Suite is costlier than Junior."
                elif 'business' in roomTypeToken and 'superior' in roomTypeToken:
                    ans = "On comparing Business with Superior type rooms, the Superior has breakfast, wifi, beverages, and AC. The Superior is costlier than Business."
                elif 'junior' in roomTypeToken and 'superior' in roomTypeToken:
                    ans = "On comparing Junior with Superior type rooms, the Superior has breakfast, wifi, beverages, and AC. The Superior is costlier than Junior."
                elif 'presidential' in roomTypeToken and 'superior' in roomTypeToken:
                    ans = "On comparing Presidential with Superior type rooms, the Superior has breakfast, wifi, beverages, and AC. The Superior is costlier than Presidential."
                elif 'suite' in roomTypeToken and 'superior' in roomTypeToken:
                    ans = "On comparing Suite with Superior type rooms, the Superior has breakfast, wifi, beverages, and AC. The Superior is costlier than Suite."
                else:
                    ans = "The costliest room type cannot be determined."

                # print(ans)
            else:
                ans+="Please wait, while we are fetching your room "
                if(len(roomTypeToken)!=0):
                    tag='backend'
                    ans+='with {} types'.format(",".join(roomTypeToken))
                # if(len(roomTypeToken)!=0 and )
                if(len(hotelAmenitiesToken)!=0 or len(roomAmenitiesToken)!=0):
                    tag='backend'
                    if(len(roomTypeToken)!=0):
                        ans+=", along "
                    ans+="with the {} facilities ".format(",".join(roomAmenitiesToken+hotelAmenitiesToken))

        elif(tag=='people'):
            adult=0
            child=0
            i=0
            n=len(sentence)
            while i<n:
                word=sentence[i]
                if(word=='me'):  # counting me as adult
                    adult+=1
                elif(word in numeric_words):  #if a numeric word is found
                    if(sentence[i+1] in ["children",'kid','kids','child','sons','daughters','son','daughter']):  #followed by this strings
                        child+=count_numeric_words(word)
                    elif(sentence[i+1] in ['year','years']): #finding the childs age 
                        pass
                    else:
                        adult+=count_numeric_words(word)
                elif(word=="i" and (sentence[i+1]=="am" or sentence[i+1]=="'m")): #counting I am and i'm as 1 adult
                    adult+=1
                elif(word=='couple'):  #couples are counted as two adult
                    adult+=2
                elif(word in ['myself']): 
                    adult+=1
                elif(word=='my'):  #if started with my
                    if(sentence[i+1].isdigit()): #followed by number
                        count=int(sentence[i+1])
                        if(sentence[i+2]in['children','son','sons','kids','daughter','daughters']):  # like 'my 2 children'
                            child+=count
                        elif(sentence[i+2] in ['friends','brothers','sisters','sister','brother']): #like 'my 2 friends'
                            adult+=count
                        else:  # else added as adult
                            adult+=count
                        i+=2
                    elif(sentence[i+1] in numeric_words):  #similar for the numeric words
                        count=count_numeric_words(sentence[i+1])
                        if(sentence[i+2] in ['children','kids','son','sons','daughter','daughters']):
                            child+=count
                        elif(sentence[i+2] in ['friends','brothers','sisters']):
                            adult+=count
                        else:
                            adult+=count
                        i+=2
                    elif(sentence[i+1] in ['wife','husband','friend','father','mother','mom','dad','friends','brother','sister','girlfriend','boyfriend','cousin','people','lover','family'] ): #like 'my wife'
                        adult+=1
                        i+=1
                    elif(sentence[i+1] in ['son','child','daughter']):
                        child+=1
                        i+=1
                    elif(sentence[i+1] in ['girl','boy'] and sentence[i+2] in ['friend']):
                        adult+=1
                        i+=2
                elif word.isdigit():  # followed by number
                    count = int(word)
                    if i + 1 < n and sentence[i + 1] in ['children', 'son', 'sons', 'daughter', 'daughters']:
                        child += count
                    elif i + 1 < n and sentence[i + 1] in ['friends', 'brothers', 'sisters', 'sister', 'brother', 'people', 'peoples', 'friend', 'family']:
                        adult += count
                    else:
                        # Else added as adult
                        adult += count
                    i += 1
                elif(word in numeric_words):  #similar for the numeric words
                        count=count_numeric_words(word)
                        if(sentence[i+1] in ['children','son','sons','daughter','daughters']):
                            child+=count
                        elif(sentence[i+1] in  ['friends','brothers','sisters','people','peoples','friend','family']):
                            adult+=count
                        else:
                            adult+=count
                        i+=1
               
                i+=1

            ans={'adult':adult,'child':child}
        elif(tag=="location"):
            i=0
            n=len(sentence)
            done=False
            while i<n:
                word=sentence[i]
                if(word in location):
                    done=True
                    tag='backend'
                    locationToken=word
                    ans="Please wait while we are searching for the hotels in {}".format(locationToken)
                i+=1
            if not done:
                ans="We have rooms at {}".format(locationToken)
        elif(tag=='duration'):
            i=0
            n=len(sentence)
            while(i<n):
                word = sentence[i]
                if(word.isdigit() and sentence[i+1]=='days'):
                    duration=int(word)
                elif(word in numeric_words and sentence[i+1]=='days'):
                    duration=count_numeric_words(word)
                i+=1

        elif(tag=='date'):
            for word in sentence:
                word=word.strip()
                if(word in days_mapping):
                    date=get_upcoming_day(word)
                    break;
                elif(word=="weekend"):
                    date=get_upcoming_day("saturday")
                    break;
                elif(word=="today"):
                    date=datetime.now()
                    today = datetime.datetime.now()
                    tomorrow = today + datetime.timedelta(days=1)
                    break
                elif(word=="tomorrow"):
                    break
                elif re.match(pattern_str,word):
                    date=convert_to_date(word)
                    if date < datetime.now():
                        ans="The date you provided is in the past. Please provide a future date."
                    break
            else:
                ans="Please provide the date in the date-month-year format."
        elif(tag=='price'):
            i=0
            n=len(sentence)
            while i<n:
                if(sentence[i].isdigit()):
                    if(int(sentence[i])>cash):
                      cash=int(sentence[i])
                      ans="Please wait while we are fetching the rooms of rate {}".format(cash)
                i+=1
            else:
                ans="Our service starts from rupees 5000 per night"
        else:
            for intent in intents['intents']:
                if tag == intent["tag"]:
                    ans=(f"{random.choice(intent['responses'])}")
                    break
    else:   #if tag not found
        tag=''
        ans=("sorry, I do not understand, please try to convey your message in a clear format and Since I am a hotel booking bot, I can't answer general questions")
    return {'tag':tag,'roomAmenities':roomAmenitiesToken,'hotelAmenities':hotelAmenitiesToken,'roomTypes':roomTypeToken,'statement':ans,'numbers':cash,'location':locationToken,'date':date,'duration':duration}

