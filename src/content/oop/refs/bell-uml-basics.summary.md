### UML basics: An introduction to the Unified Modeling Language
**Author:** Donald Bell
**Originally Published:** June 15, 2003 (Updated 2004/2005)
**Publisher:** IBM Developer (formerly developerWorks)

---

### **Executive Overview**
Donald Bell’s article serves as a foundational guide for software blueprinting using the Unified Modeling Language (UML). It was written primarily to introduce IT professionals to UML 2.0, explaining that UML is not a methodology itself but a specialized language used to visualize, specify, construct, and document the artifacts of a software-intensive system.

The article breaks down the 13 official UML diagrams (as defined in UML 2.0) into three main categories: **Structure Diagrams**, **Behavior Diagrams**, and **Interaction Diagrams**.

---

### **1. Structure Diagrams**
These diagrams represent the static aspects of the system—the parts that exist regardless of time.

*   **Class Diagram:** The most common UML diagram. It describes the structure of a system by showing its classes, their attributes, operations (or methods), and the relationships among objects. 
    *   *Key Relationships:* Association, Aggregation (part-of), Composition (strong part-of), and Generalization (inheritance).
*   **Object Diagram:** A snapshot of the instances in a system at a particular point in time.
*   **Component Diagram:** Describes how a system is divided into physical components and the dependencies between them.
*   **Composite Structure Diagram:** Details the internal structure of a class and the "ports" through which it interacts with the environment.
*   **Package Diagram:** Depicts how model elements are organized into packages and the dependencies between those packages.
*   **Deployment Diagram:** Shows the physical hardware on which the software system will be deployed.

---

### **2. Behavior Diagrams**
These diagrams depict the dynamic aspects of the system—how it changes over time.

*   **Use Case Diagram:** Describes the functionality of a system in terms of "Use Cases," the "Actors" (users or other systems) who interact with them, and the boundaries of the system.
*   **Activity Diagram:** Illustrates the step-by-step workflow of components in a system. It is similar to a flowchart but supports parallel behavior.
*   **State Machine Diagram:** (Formerly Statechart) Shows the life cycle of an individual object, including the states it can reside in and the transitions that cause a change from one state to another.

---

### **3. Interaction Diagrams**
A subset of behavior diagrams, these focus specifically on the flow of control and data between objects.

*   **Sequence Diagram:** The most important interaction diagram. It shows object interactions arranged in time sequence. It depicts the objects involved in the scenario and the sequence of messages exchanged.
*   **Communication Diagram:** (Formerly Collaboration Diagram) Focuses on the structural organization of the objects that send and receive messages.
*   **Interaction Overview Diagram:** A high-level hybrid between an activity diagram and a sequence diagram.
*   **Timing Diagram:** Focuses on the specific timing constraints of messages sent between objects.

---

### **Key Technical Concepts Explained**

#### **Class Diagram Notation**
Bell explains the three-compartment box for classes:
1.  **Top:** Class Name.
2.  **Middle:** Attributes (variables).
3.  **Bottom:** Operations (methods).
He also defines visibility markers: `+` (public), `-` (private), and `#` (protected).

#### **The Importance of Sequence Diagrams**
The article emphasizes that sequence diagrams are excellent for documenting a system's logic and clarifying requirements. Key elements include:
*   **Lifelines:** Vertical dashed lines representing the existence of an object.
*   **Messages:** Horizontal arrows representing communication.
*   **Activation Bars:** Thin rectangles on lifelines showing when an object is performing an operation.

#### **Why use UML?**
Bell concludes that using UML allows teams to communicate in a "common language." It reduces ambiguity in requirements and provides a roadmap for developers, ensuring that the final code aligns with the intended architectural design.

---

**Note:** This article was a staple for the IBM Rational software community and is widely cited in undergraduate software engineering courses as the definitive "quick start" guide for UML 2.0.