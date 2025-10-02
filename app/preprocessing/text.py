from sklearn.feature_extraction.text import TfidfVectorizer

def text_vectorize(corpus, max_features=5000):
    """Convert text corpus to TF-IDF features."""
    vectorizer = TfidfVectorizer(max_features=max_features, stop_words='english')
    X = vectorizer.fit_transform(corpus)
    return X, vectorizer
