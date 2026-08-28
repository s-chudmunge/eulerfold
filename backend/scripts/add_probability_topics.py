import csv
import os

topics = [
    ("Probability: Counting and Combinatorics", "Lecture 1: Probability and Counting", "Harvard University", ""),
    ("Probability: Axioms and Properties", "Lecture 1: Probability Models and Axioms", "MIT OpenCourseWare", ""),
    ("Probability: Conditional Probability", "Lecture 2: Conditioning and Bayes' Rule", "MIT OpenCourseWare", ""),
    ("Bayes' Theorem", "Bayes theorem", "3Blue1Brown", ""),
    ("Discrete Random Variables: PMF and CDF", "Lecture 5: Discrete Random Variables", "MIT OpenCourseWare", ""),
    ("Expected Value and Variance", "Lecture 6: Expectations", "MIT OpenCourseWare", ""),
    ("The Binomial Distribution", "The Binomial Distribution", "StatQuest with Josh Starmer", ""),
    ("The Poisson Distribution", "Poisson Distribution", "StatQuest with Josh Starmer", ""),
    ("The Geometric and Negative Binomial Distributions", "Lecture 11: The Poisson process", "Harvard University", ""), # adjusted
    ("Continuous Random Variables and PDFs", "Lecture 8: Continuous Random Variables", "MIT OpenCourseWare", ""),
    ("The Uniform and Exponential Distributions", "Exponential Distribution", "StatQuest with Josh Starmer", ""),
    ("The Normal (Gaussian) Distribution", "The Normal Distribution", "StatQuest with Josh Starmer", ""),
    ("Multiple Random Variables: Joint Distributions", "Lecture 9: Multiple Continuous Random Variables", "MIT OpenCourseWare", ""),
    ("Marginal and Conditional Distributions", "Lecture 10: Continuous Bayes' Rule", "MIT OpenCourseWare", ""),
    ("Covariance and Correlation", "Lecture 24: Covariance and Correlation", "Harvard University", ""),
    ("Conditional Expectation", "Lecture 11: Derived Distributions", "MIT OpenCourseWare", ""),
    ("Moment Generating Functions (MGFs)", "Lecture 26: Moment Generating Functions", "Harvard University", ""),
    ("Markov and Chebyshev Inequalities", "Lecture 14: Iterated Expectations", "MIT OpenCourseWare", ""),
    ("The Weak Law of Large Numbers", "Lecture 15: Weak Law of Large Numbers", "MIT OpenCourseWare", ""),
    ("The Central Limit Theorem", "But what is the Central Limit Theorem?", "3Blue1Brown", ""),
    ("Introduction to Markov Chains", "Lecture 16: Markov Chains I", "MIT OpenCourseWare", ""),
    ("Markov Chains: Steady-State Probabilities", "Lecture 17: Markov Chains II", "MIT OpenCourseWare", ""),
    ("Poisson Processes: Basic Definitions", "Lecture 21: Poisson Processes", "MIT OpenCourseWare", ""),
    ("Poisson Processes: Merging and Splitting", "Lecture 22: Poisson Processes II", "MIT OpenCourseWare", ""),
    ("Introduction to Stochastic Processes", "Lecture 23: Introduction to Stochastic Processes", "MIT OpenCourseWare", ""),
    ("Brownian Motion and Random Walks", "Random Walks", "Harvard University", ""),
    ("Martingales", "Lecture 33: Martingales", "Harvard University", "")
]

csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'curated_topics_blueprint.csv')

with open(csv_path, 'a', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    for topic in topics:
        writer.writerow(topic)

print(f"Appended {len(topics)} new Probability topics to curated_topics_blueprint.csv")
