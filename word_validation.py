import nltk
from nltk.corpus import words

# Download the words corpus if you haven't already
nltk.download('words')

# Function to check if a word is valid
def is_word(word):
    return word.lower() in words.words()

# Function to filter out non-words from a sentence
def filter_non_words(sentence):
    words_in_sentence = sentence.split()
    valid_words = [word for word in words_in_sentence if is_word(word)]
    return ' '.join(valid_words)

# Input sentence
sentence = input("Enter a sentence: ")

# Filter non-words from the sentence
filtered_sentence = filter_non_words(sentence)

print("Filtered sentence without non-words:")
print(filtered_sentence)
