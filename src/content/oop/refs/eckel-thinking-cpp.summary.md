**Thinking in C++, 2nd Edition** by Bruce Eckel is widely considered one of the seminal texts for learning the C++ programming language. Originally published by Prentice Hall, the author later released the electronic versions for free under a public license. The work is divided into two volumes.

### **Volume 1: Introduction to Standard C++**
This volume focuses on the fundamental concepts of the language, transitioning from the procedural mindset of C to the object-oriented paradigm of C++.

#### **Table of Contents (Volume 1)**
1.  **Introduction to Objects:** An overview of the progress of abstraction and object-oriented programming.
2.  **Making & Using Objects:** The process of compiling, linking, and creating basic objects.
3.  **The C in C++:** Review of C syntax, operators, and control flow as they apply to C++.
4.  **Data Abstraction:** Creating your own data types using `struct` and the concept of the "Object."
5.  **Hiding the Implementation:** Access control (public, private, protected) and the concept of the API.
6.  **Initialization & Cleanup:** Constructors and destructors.
7.  **Function Overloading & Default Arguments:** Simplifying interfaces.
8.  **Constants:** The use of `const`, constant pointers, and the "const-correctness" philosophy.
9.  **Inline Functions:** Reducing overhead and the difference between macros and inline functions.
10. **Name Control:** Static elements, namespaces, and storage classes.
11. **References & the Copy-Constructor:** Passing by reference vs. value and the mechanism of copying objects.
12. **Operator Overloading:** Customizing how operators work with user-defined types.
13. **Dynamic Object Creation:** Using `new` and `delete` and managing the heap.
14. **Inheritance & Composition:** Building new classes from existing ones.
15. **Polymorphism & Virtual Functions:** The core of OO; late binding and abstract base classes.
16. **Introduction to Templates:** Basics of generic programming.

#### **Key Summary of Volume 1**
Eckel emphasizes that "Thinking in C++" means understanding how the language manages memory and how objects interact. He argues against the "C-with-classes" approach, instead advocating for a deep understanding of the C++ object model, specifically focusing on how constructors, destructors, and virtual function tables (vtables) work under the hood.

---

### **Volume 2: Practical Programming**
Volume 2 (co-authored with Chuck Allison) covers advanced features and the Standard Template Library (STL).

#### **Table of Contents (Volume 2)**
1.  **Exception Handling:** Error recovery and writing "exception-safe" code.
2.  **Standard C++ Vectors:** In-depth look at the `vector` container.
3.  **Generic Programming:** Building templates that work across different data types.
4.  **The Standard Template Library (STL):** Iterators, algorithms, and containers (maps, sets, lists).
5.  **IOStreams:** Advanced input/output, file handling, and string streams.
6.  **Writing Robust Systems:** Debugging techniques and defensive programming.
7.  **Runtime Type Identification (RTTI):** How to determine the type of an object at runtime.
8.  **Multiple Inheritance:** The complexities and patterns of inheriting from multiple parents.
9.  **Design Patterns:** Applying classic GoF (Gang of Four) patterns in C++.
10. **Concurrency:** Introduction to multi-threading (in the context of C++ at the time of publication).

#### **Key Summary of Volume 2**
This volume is geared toward professional application development. It focuses heavily on the STL, teaching the reader how to use pre-built algorithms rather than reinventing data structures. The section on Design Patterns is particularly famous, as it shows how C++ features (like templates and polymorphism) can be used to solve common architectural problems.

---

### **Core Philosophies of the Book**
*   **The "Why" over the "How":** Eckel explains the design decisions behind the C++ language features.
*   **Small Code Examples:** Every chapter includes numerous short, compilable programs that isolate specific features.
*   **Transitioning from C:** The book is designed for those who might know C but need to unlearn procedural habits to master objects.
*   **Resource Management:** A major theme is the "Resource Acquisition Is Initialization" (RAII) idiom, though it is explored through the lens of constructors/destructors.

### **Availability Note**
Because Bruce Eckel released this book under a Creative Commons-style license, the full HTML and PDF versions are legally available for download on his official website (**MindView.net**) and via various university mirrors. Search for "Thinking in C++ Bruce Eckel Free Electronic Version" to access the full 1,000+ pages of text and source code.