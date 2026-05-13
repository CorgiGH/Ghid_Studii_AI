# OOP c7 step ids — captured from stage5-draft.json

Captured: 2026-05-13
Source: src/content/oop/.curate/Course-7/stage5-draft.json (10 steps, 81 blocks)

## JSON step ids in order

1. oop-c7-overview — Why STL? (intro, no quiz)
2. oop-c7-vector — std::vector
3. oop-c7-deque-array — deque + array
4. oop-c7-list-forward — list + forward_list + comparison
5. oop-c7-adaptors — stack / queue / priority_queue
6. oop-c7-io-streams — iostream hierarchy + manipulators + file/binary I/O
7. oop-c7-strings — basic_string + char_traits + string_view
8. oop-c7-init-lists — initializer_list + brace init + variadic macros
9. oop-c7-iterators — iterator categories + invalidation + reverse
10. oop-c7-quiz — comprehensive self-test (10 questions, spaced)

## Legacy → new ordinal mapping for AppContext shim

The legacy JSX (`Course07.jsx`) used 6 section IDs covering 6 topics (no intro, no final quiz). Map each legacy section id to the corresponding new content step by topic match:

| Legacy `checked` key | New `progress` key |
|---|---|
| `oop-course_7-sequence`  | `oop-c7-vector` (first sequence-containers step; deque-array + list-forward inherit no progress) |
| `oop-course_7-adaptors`  | `oop-c7-adaptors` |
| `oop-course_7-streams`   | `oop-c7-io-streams` |
| `oop-course_7-strings`   | `oop-c7-strings` |
| `oop-course_7-init-lists`| `oop-c7-init-lists` |
| `oop-course_7-iterators` | `oop-c7-iterators` |

Note: legacy section 1 (`oop-course_7-sequence`) covered vector + deque + array + list + forward_list. New JSON splits this into three steps (vector, deque-array, list-forward). The shim attaches legacy progress only to the FIRST of the three (`oop-c7-vector`) — the other two register as "not visited" until the user actually opens them. This is the spec's "ordinal map; unmapped legacy keys stay" rule, applied at the topic boundary.

Intro step (`oop-c7-overview`) and final quiz step (`oop-c7-quiz`) have no legacy counterpart — fresh starts.
