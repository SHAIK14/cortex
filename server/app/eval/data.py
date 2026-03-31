MESSAGES = [
    # contradicts existing "lives in Bangalore" → should update
    {"role": "user", "content": "I moved from Mumbai to Delhi last week"},
    # brand new info → should add
    {"role": "user", "content": "I recently started learning Spanish"},
    {"role": "user", "content": "I just bought a new MacBook Pro"},
    # already exists → should noop
    {"role": "user", "content": "my name is Asif"},
    {"role": "user", "content": "I work as an SDE at Optimum Solution"},
]
