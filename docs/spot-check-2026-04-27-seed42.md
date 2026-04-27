# Content spot-check — 2026-04-27

> Council 1777313729 step 2. Sample 50 MC questions, grade by hand against source PDFs in `wiki/raw/pdfs/`. Mark each as ✅ correct, ❌ wrong, or ⚠ ambiguous. Tally at the bottom.

Sample seed: `42` (rerun with `--seed=42` to reproduce). Source pool: 404 MC questions; tests biased ~60%.

---

## OS (38)

### 1. `src/content/os/courses/course-07.json` — `os-c7-example-open-files-b3-q0`
*Source hint: os-c7-example-open-files*

**Q:** What happens to unflushed printf() buffers when exec() is called?

- 0) They are automatically flushed before exec
- 1) They are saved and restored in the new program
- 2) The buffered data is lost ← **recorded correct**
- 3) They cause exec to fail

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 2. `src/content/os/tests/examen2021-2022-restanta-curs-partea-1.json` — `q10`
*Source hint: Operating Systems - Theoretical Retake Exam*

**Q:** Which allocation method is used by the ext4fs file system in Linux?

- 0) contiguous allocation
- 1) none of the mentioned methods
- 2) linked allocation
- 3) indexed allocation ← **recorded correct**

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 3. `src/content/os/tests/examen2023-2024-examen-teoretic-2023-2024.json` — `q4`
*Source hint: Operating Systems Quiz Bank - Theory and POSIX*

**Q:** Which POSIX file I/O call is used to create a directory type file?

- 0) creat
- 1) makedir
- 2) mkdir ← **recorded correct**
- 3) mkfolder
- 4) chroot

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 4. `src/content/os/tests/examen2021-2022-restanta-curs-partea-1.json` — `q12`
*Source hint: Operating Systems - Theoretical Retake Exam*

**Q:** What is the name of the algorithm used for dynamic memory allocation that selects the free space of maximum size that is large enough for the received request?

- 0) FFA
- 1) WFA ← **recorded correct**
- 2) BFA
- 3) Buddy-system allocator
- 4) None of the mentioned

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 5. `src/content/os/tests/examen2021-2022-test-2-lab-so-t2-1.json` — `q10`
*Source hint: Operating Systems - Lab Test 2*

**Q:** What happens if a process executes a write call to an anonymous communication channel at a time when no process has the read end of that channel open?

- 0) the write call remains blocked until another process opens the read end of that channel
- 1) the write call returns immediately and the program continues its execution
- 2) the system notifies the process about this situation through a SIGPIPE signal ← **recorded correct**
- 3) the process is forcibly terminated and the message "Segmentation fault" is displayed
- 4) the system notifies the process about this situation through a SIGFIFO signal

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 6. `src/content/os/courses/course-05.json` — `os-c5-advisory-b4-q1`
*Source hint: os-c5-advisory*

**Q:** Can multiple processes hold read locks (F_RDLCK) on the same file region simultaneously?

- 0) No, only one process can lock a region at a time
- 1) Yes, read locks are shared (CREW model) ← **recorded correct**
- 2) Only if they are from the same user
- 3) Only with F_SETLKW

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 7. `src/content/os/tests/examen2020-2021-part-1.json` — `q6`
*Source hint: Operating Systems – Theoretical Exam*

**Q:** What is the name of the algorithm used for page-swapping that selects as a victim a page that has not been accessed in the recent past?

- 0) LRU ← **recorded correct**
- 1) FIFO
- 2) LFU
- 3) NRU
- 4) MFU

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 8. `src/content/os/tests/examen2023-2024-examen-teoretic-2023-2024.json` — `q81`
*Source hint: Operating Systems Quiz Bank - Theory and POSIX*

**Q:** What is the name of the algorithm used for page-swapping that selects as a victim a page that has not been accessed in the recent past?

- 0) LRU ← **recorded correct**
- 1) LFU
- 2) MFU
- 3) FIFO
- 4) NRU

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 9. `src/content/os/tests/examen2021-2022-test-1-lab.json` — `q9`
*Source hint: Operating Systems - Laboratory Test 1 (2022)*

**Q:** [C] What is the POSIX file I/O call that we use to read information from a regular file?

- 0) fscanf
- 1) fprintf
- 2) read ← **recorded correct**
- 3) scanf
- 4) fread

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 10. `src/content/os/tests/examen2021-2022-test-1-lab-2021-partialsot2-2021.json` — `q2`
*Source hint: Operating Systems Evaluation Test – Application Questions*

**Q:** [bash] What is the find command option to search by filenames that match a given pattern, ignoring case (case insensitive)?

- 0) -name
- 1) -iname ← **recorded correct**
- 2) -Iname
- 3) -igname

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 11. `src/content/os/tests/examen2021-2022-test-1-lab.json` — `q26`
*Source hint: Operating Systems - Laboratory Test 1 (2022)*

**Q:** [C] What does the `l_whence` field from the `flock` structure, defined in the `fcntl.h` header file (for using locks), indicate?

- 0) the type of locking by the corresponding lock
- 1) position relative to the origin, of the start of the zone where the blocking is done
- 2) the relative position (origin) of locking using that lock ← **recorded correct**
- 3) the length of the portion blocked by the corresponding lock
- 4) the file descriptor on which the lock is placed
- 5) the PID of the process owner of that lock

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 12. `src/content/os/tests/examen2021-2022-test-1-lab-2021-partialsot2-2021.json` — `q9`
*Source hint: Operating Systems Evaluation Test – Application Questions*

**Q:** [bash] What is the command that displays the first 15 lines of text from the program prg1.c located on the desktop of the current user?

- 0) firstlines -15 Desktop/prg1.c
- 1) head --lines=15 ~/Desktop/prg1.c ← **recorded correct**
- 2) cat --lines=15 Desktop/prg*.c
- 3) head -n -15 ~Desktop/prg1.c

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 13. `src/content/os/tests/examen2023-2024-examen-teoretic-2023-2024.json` — `q16`
*Source hint: Operating Systems Quiz Bank - Theory and POSIX*

**Q:** Which of the following algorithms is used to solve the critical section problem, in the particular case n=2?

- 0) Peterson's Algorithm ← **recorded correct**
- 1) Dijkstra's Algorithm
- 2) Banker's Algorithm
- 3) Courtois, Heymans and Parnas Algorithm
- 4) None of those mentioned

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 14. `src/content/os/tests/examen2021-2022-curs-partea-1.json` — `q13`
*Source hint: "Operating Systems" - Theoretical Exam*

**Q:** What is the disk allocation unit for a file in general-purpose file systems? (0.5p)

- 0) Cluster ← **recorded correct**
- 1) Bit
- 2) None of the mentioned
- 3) Byte (8 bits)
- 4) Sector (disk block)

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 15. `src/content/os/tests/examen2021-2022-test-1-lab-2021-partialsot2-2021.json` — `q10`
*Source hint: Operating Systems Evaluation Test – Application Questions*

**Q:** [bash] What is the command that displays ONLY the commands, including their received arguments, of processes running under the root account context?

- 0) ps aux -u root -o comm=
- 1) ps aux -U root -o command
- 2) ps -u 0 -o command= ← **recorded correct**
- 3) ps -u root -o comm=

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 16. `src/content/os/tests/examen2021-2022-curs-partea-1.json` — `q5`
*Source hint: "Operating Systems" - Theoretical Exam*

**Q:** In what context is the Bakery algorithm used (i.e., what problem does this algorithm solve)? (0.5p)

- 0) deadlock prevention
- 1) deadlock detection
- 2) bakery operations
- 3) mutual exclusion (i.e., the critical section problem) ← **recorded correct**
- 4) deadlock avoidance
- 5) solving the starved sets problem

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 17. `src/content/os/tests/examen2021-2022-curs-partea-1.json` — `q4`
*Source hint: "Operating Systems" - Theoretical Exam*

**Q:** Which scheduler is responsible for allocating CPU time to processes in the 'ready' state? (0.5p)

- 0) None of the mentioned
- 1) Short-term scheduler ← **recorded correct**
- 2) Long-term scheduler
- 3) Medium-term scheduler

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 18. `src/content/os/courses/course-01.json` — `os-c1-mounting-b3-q0`
*Source hint: os-c1-mounting*

**Q:** Which command is used to attach a filesystem to the directory tree?

- 0) attach
- 1) mount ← **recorded correct**
- 2) link
- 3) connect

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 19. `src/content/os/courses/course-06.json` — `os-c6-fork-b6-q0`
*Source hint: os-c6-fork*

**Q:** What value does fork() return in the child process on success?

- 0) -1
- 1) The parent's PID
- 2) 0 ← **recorded correct**
- 3) 1

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 20. `src/content/os/tests/examen2021-2022-curs-partea-1.json` — `q7`
*Source hint: "Operating Systems" - Theoretical Exam*

**Q:** What allocation method does the btrfs file system use in Linux? (0.5p)

- 0) Contiguous allocation
- 1) Linked allocation
- 2) None of the mentioned methods
- 3) Indexed allocation ← **recorded correct**

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 21. `src/content/os/courses/course-08.json` — `os-c8-msync-b5-q0`
*Source hint: os-c8-msync*

**Q:** What happens if you call munmap without first calling msync?

- 0) All changes are automatically saved to disk
- 1) Recent changes may be lost (not propagated to disk) ← **recorded correct**
- 2) The program crashes with SIGSEGV
- 3) munmap fails and returns -1

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 22. `src/content/os/tests/examen2021-2022-test-1-lab-2021-partialsot1-2021.json` — `q8`
*Source hint: Operating Systems Theoretical Test - Bash and POSIX I/O*

**Q:** [C] Which is the POSIX I/O file call, used to create a fifo type file? (0.5p)

- 0) creat
- 1) makefifo
- 2) mkfifo ← **recorded correct**
- 3) fifomake
- 4) chroot

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 23. `src/content/os/courses/course-01.json` — `os-c1-files-filesystems-b3-q0`
*Source hint: os-c1-files-filesystems*

**Q:** How many file types does UNIX recognize?

- 0) 3
- 1) 4
- 2) 6 ← **recorded correct**
- 3) 8

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 24. `src/content/os/tests/examen2020-2021-part-1.json` — `q7`
*Source hint: Operating Systems – Theoretical Exam*

**Q:** What is the name of the algorithm used for dynamic memory allocation that selects the smallest free memory space that is sufficiently large relative to the received request?

- 0) WFA
- 1) None of the mentioned
- 2) BFA ← **recorded correct**
- 3) Buddy-system allocator
- 4) FFA

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 25. `src/content/os/tests/examen2020-2021-part-1.json` — `q5`
*Source hint: Operating Systems – Theoretical Exam*

**Q:** Which RAID level provides better data access performance but does not provide better data storage safety?

- 0) RAID 0 ← **recorded correct**
- 1) RAID 4
- 2) RAID 2
- 3) RAID 1
- 4) RAID 6
- 5) RAID 3
- 6) RAID 5

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 26. `src/content/os/tests/examen2021-2022-test-2-lab-so-t2-1.json` — `q8`
*Source hint: Operating Systems - Lab Test 2*

**Q:** A process has opened the read end of a FIFO communication channel for reading only, without other additional flags, and then, at a time when the channel is empty and another process has the write end open in that channel, the process executes a POSIX read call from the channel. What happens to that read call?

- 0) the read call returns immediately with value -1 and the errno variable is set according to the cause of the error
- 1) the read call remains blocked until another process writes enough information into that channel ← **recorded correct**
- 2) the read call returns immediately with value 0 and the program continues its execution
- 3) the system notifies the process about this situation through a SIGPIPE signal
- 4) the process is forcibly terminated and the message "Broken pipe" is displayed

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 27. `src/content/os/tests/examen2021-2022-test-1-lab.json` — `q6`
*Source hint: Operating Systems - Laboratory Test 1 (2022)*

**Q:** [bash] What is the special variable that has the value of the number of positional parameters in the call line?

- 0) $@
- 1) $$
- 2) $# ← **recorded correct**
- 3) $?
- 4) $!
- 5) $*

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 28. `src/content/os/tests/examen2023-2024-examen-teoretic-2023-2024.json` — `q30`
*Source hint: Operating Systems Quiz Bank - Theory and POSIX*

**Q:** Which POSIX file I/O call do we use to read information from a regular file?

- 0) fscanf
- 1) fprintf
- 2) read ← **recorded correct**
- 3) scanf
- 4) fread

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 29. `src/content/os/tests/examen2023-2024-examen-teoretic-2023-2024.json` — `q8`
*Source hint: Operating Systems Quiz Bank - Theory and POSIX*

**Q:** What happens if a process executes a write call into an anonymous communication channel at a time when no process has the reading end of that channel open?

- 0) the write call stays blocked until another process opens the reading end
- 1) the system notifies the process via a SIGPIPE signal ← **recorded correct**
- 2) the write call returns immediately and program execution continues
- 3) the system notifies the process via a SIGFIFO signal
- 4) the process is forcefully terminated with 'Segmentation fault'

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 30. `src/content/os/tests/examen2021-2022-test-1-lab-2021-partialsot1-2021.json` — `q6`
*Source hint: Operating Systems Theoretical Test - Bash and POSIX I/O*

**Q:** [bash] Which is the special variable that holds the termination code of the last command executed in the foreground? (0.5p)

- 0) $@
- 1) $$
- 2) $#
- 3) $? ← **recorded correct**
- 4) $!
- 5) $*

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 31. `src/content/os/tests/examen2021-2022-test-1-lab.json` — `q20`
*Source hint: Operating Systems - Laboratory Test 1 (2022)*

**Q:** [bash] What is the command that displays the owner's name, permissions in symbolic format, and file type of `myscript.sh` from the `Scripturi` subdirectory in the current user's home directory?

- 0) stat -c "%U %a %n" Scripturi/myscript.sh
- 1) stat --format="%U %A %F" ~/Scripturi/myscript.sh ← **recorded correct**
- 2) stat -c "%u %A %f" ~Scripturi/myscript.sh
- 3) stat --format=%u\ %a\ %F ~/Scripturi/myscript.sh

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 32. `src/content/os/courses/course-05.json` — `os-c5-optimized-b4-q0`
*Source hint: os-c5-optimized*

**Q:** What is the race condition in access_v3.c?

- 0) Two processes might try to open the same file
- 1) Between finding '#' and acquiring the lock, another process might overwrite it ← **recorded correct**
- 2) The file descriptor might become invalid
- 3) The lock structure might be corrupted

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 33. `src/content/os/tests/examen2020-2021-part-1.json` — `q4`
*Source hint: Operating Systems – Theoretical Exam*

**Q:** In what context is the Banker's algorithm used (i.e., what problem does this algorithm solve)?

- 0) Deadlock avoidance ← **recorded correct**
- 1) Deadlock prevention
- 2) Deadlock detection
- 3) Mutual exclusion (i.e., critical section problem)
- 4) Granting a bank loan

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 34. `src/content/os/courses/course-11.json` — `os-c11-terminals-pseudoterminals-b3-q0`
*Source hint: os-c11-terminals-pseudoterminals*

**Q:** Which command shows the terminal device you are connected to?

- 0) stty
- 1) tty ← **recorded correct**
- 2) terminal
- 3) who

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 35. `src/content/os/tests/examen2021-2022-test-1-lab-2021-partialsot3-2021.json` — `q1`
*Source hint: Operating Systems - Application Exercises (Evaluation Form 3)*

**Q:** [bash] Specify the correct order for chaining the 4 commands below so that the resulting pipeline displays 1 only if the file `test.so` can be read by other users in the owner's group, and 0 otherwise. Commands: - `stat --format "%A" test.so`  - `cut -c5-7`  - `grep r`  - `wc -l`

- 0) 1: stat, 2: cut, 3: grep, 4: wc ← **recorded correct**
- 1) 1: stat, 2: grep, 3: cut, 4: wc

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 36. `src/content/os/tests/examen2021-2022-restanta-curs-partea-1.json` — `q7`
*Source hint: Operating Systems - Theoretical Retake Exam*

**Q:** Which of the following algorithms used for disk access optimization has a name similar to that of a processor scheduling algorithm?

- 0) C-LOOK
- 1) SCAN
- 2) SSTF ← **recorded correct**
- 3) C-SCAN
- 4) FCFS
- 5) LOOK

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 37. `src/content/os/tests/examen2023-2024-examen-teoretic-2023-2024.json` — `q6`
*Source hint: Operating Systems Quiz Bank - Theory and POSIX*

**Q:** What is the POSIX call used to find the ID of the effective owner of the calling process?

- 0) getpid
- 1) getppid
- 2) getgid
- 3) getuid
- 4) geteuid ← **recorded correct**
- 5) getegid

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 38. `src/content/os/tests/examen2020-2021-part-4.json` — `q8`
*Source hint: Operating Systems - Theoretical Exam, CPU Scheduling*

**Q:** Which process has the highest penalty rate?

- 0) A
- 1) B
- 2) C
- 3) D ← **recorded correct**
- 4) E

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

## PA (6)

### 39. `src/content/pa/courses/course-05.json` — `pa-c5-quiz-b0-q4`
*Source hint: pa-c5-quiz*

**Q:** What is the total time complexity of KMP (search + preprocessing)?

- 0) $O(n \cdot m)$
- 1) O(n + m) ← **recorded correct**
- 2) $O(n \cdot \log m)$
- 3) $O(n^2)$

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 40. `src/content/pa/courses/course-06.json` — `pa-c6-quiz-b0-q8`
*Source hint: pa-c6-quiz*

**Q:** Which of the following distinguishes the Monte Carlo variant of Rabin-Karp from the Las Vegas variant?

- 0) Monte Carlo may report a false match because it skips the character-by-character verification; Las Vegas always verifies and is always correct. ← **recorded correct**
- 1) Monte Carlo is always O(n+m) while Las Vegas is $\Theta(n\cdot m)$ in the worst case.
- 2) Monte Carlo uses a different hash function than Las Vegas.
- 3) Las Vegas does not use a rolling hash.

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 41. `src/content/pa/courses/course-06.json` — `pa-c6-quiz-b0-q1`
*Source hint: pa-c6-quiz*

**Q:** In the Rabin-Karp algorithm, what is a rolling hash?

- 0) A hash function that uses a circular buffer
- 1) A technique to compute the next window's hash from the previous one in O(1) ← **recorded correct**
- 2) A hash function that never produces collisions
- 3) A method to hash 2D matrices

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 42. `src/content/pa/courses/course-02.json` — `pa-c2-intro-b0-q0`
*Source hint: pa-c2-intro*

**Q:** Diagnostic question: why might one sorting algorithm be better than another, even if both produce the same correct output?

- 0) One uses fewer lines of code
- 1) One uses fewer computational resources (time or memory) for large inputs ← **recorded correct**
- 2) One was invented more recently

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 43. `src/content/pa/courses/course-05.json` — `pa-c5-problem-b0-q0`
*Source hint: pa-c5-problem*

**Q:** Diagnostic question: how would you search for a word in a text file?

- 0) Compare the word against every possible position in the text, character by character ← **recorded correct**
- 1) Sort the text first, then use binary search
- 2) Read the entire text into memory and use a hash table

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 44. `src/content/pa/courses/course-05.json` — `pa-c5-quiz-b0-q6`
*Source hint: pa-c5-quiz*

**Q:** Why does the computeF function resemble the KMP search function?

- 0) It is a coincidence of the implementation
- 1) Computing F is matching the pattern against itself ← **recorded correct**
- 2) Both use dynamic programming
- 3) They share the same loop structure by convention

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

## OOP (6)

### 45. `src/content/oop/courses/course-02.json` — `oop-c2-null-b4-q0`
*Source hint: oop-c2-null*

**Q:** Why does `Print(NULL)` call `Print(int)` instead of `Print(const char*)`?

- 0) Because NULL is defined as 0 (an integer) in C++ ← **recorded correct**
- 1) Because Print(int) is declared first
- 2) Because const char* has lower priority than int

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 46. `src/content/oop/courses/course-03.json` — `oop-c3-quiz-b0-q4`
*Source hint: oop-c3-constraints*

**Q:** What does `= delete` on a constructor do compared to making it private?

- 0) Same effect -- both prevent external instantiation
- 1) Delete prevents ALL callers, private allows class internals ← **recorded correct**
- 2) Delete is weaker -- it only prevents implicit calls

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 47. `src/content/oop/courses/course-06.json` — `oop-c6-quiz-b0-q3`
*Source hint: oop-c6-cast-keywords*

**Q:** Which cast checks RTTI at runtime to verify validity?

- 0) static_cast
- 1) dynamic_cast ← **recorded correct**
- 2) reinterpret_cast

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 48. `src/content/oop/courses/course-02.json` — `oop-c2-quiz-b0-q4`
*Source hint: oop-c2-const*

**Q:** Can a mutable member be modified inside a const method?

- 0) Yes -- that's the purpose of mutable ← **recorded correct**
- 1) No -- const methods cannot modify any member
- 2) Only if the method is also static

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 49. `src/content/oop/courses/course-03.json` — `oop-c3-quiz-b0-q2`
*Source hint: oop-c3-delegating*

**Q:** Can a delegating constructor also initialize other members in its initializer list?

- 0) Yes, after the delegation call
- 1) No -- delegation must be the only initializer ← **recorded correct**
- 2) Yes, but only const members

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

### 50. `src/content/oop/courses/course-04.json` — `oop-c4-quiz-b0-q5`
*Source hint: oop-c4-move-semantics*

**Q:** When does the compiler use the move constructor instead of the copy constructor?

- 0) Always, because move is faster
- 1) For temporary (rvalue) objects; named objects use copy ← **recorded correct**
- 2) Only when explicitly called with std::move()

| Verdict | Source page | Notes |
|---|---|---|
|       |             |       |

---

## Tally

- ✅ Correct (recorded matches source): __ / 50
- ❌ Wrong (recorded contradicts source): __ / 50
- ⚠ Ambiguous (cannot verify from source / poorly worded): __ / 50

**Decision rule** (per council):
- < 2 wrong → fears overblown, no action needed
- 2-5 wrong → fix flagged, audit similar questions in same files
- > 5 wrong → confidence-laundering risk realized, broaden audit + reconsider /curate trust
