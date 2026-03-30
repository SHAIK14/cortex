TEST_CASES = [
    {
        "question": "where is the user from?",
        "context": "User's name is Asif. User is from India and loves their country. User currently lives in Bangalore.",
        "expected_facts": ["India"],
    },
    {
        "question": "what does the user do for work?",
        "context": "User works as an SDE at Optimum Solution. User mostly works with Python and backend systems.",
        "expected_facts": ["SDE", "Optimum Solution"],
    },
    {
        "question": "what is the user's favorite food?",
        "context": "User's favorite food is biryani. User prefers tea over coffee.",
        "expected_facts": ["biryani"],
    },
    {
        "question": "what are the user's career goals?",
        "context": "User wants to become a senior engineer in 2 years. User wants to build their own AI startup someday.",
        "expected_facts": ["senior engineer", "startup"],
    },
    {
        "question": "does the user have any siblings?",
        "context": "User has one younger sister. User's parents live in Mumbai.",
        "expected_facts": ["sister"],
    },
    {
        "question": "what is the user's favorite food?",
        "context": "User's name is Asif. User is from India.",
        "expected_facts": [],
    },
]
