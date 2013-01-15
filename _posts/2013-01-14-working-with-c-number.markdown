---
layout: post
title: "Working with C#, C++/CLI and Managed C++"
date: 2013-01-14 23:07
comments: true
categories: [dev]
---
Recently I spent nearly 2 months working on a windows project mixing different languages such as C#, C++/CLI, Managed C++. Here is what I feel:

- Writing in C# is more fun and efficient (developing time, not execution time). You can use automatic property, anonymous function with lambda expression and LINQ. The code is more concise and expressive.

- C++/CLI is really great to mix native type and managed type together. But sometimes it takes too much brain energy (or think about) to jump between the two worlds. Also, I don't really like way that the generated UI code is in the same file as the header file, it makes the header file a really mess! Anyway, here are some useful resources/tips I can share:

    * [C++/CLI Cheat Sheet](http://manski.net/2011/04/19/cpp-cli-cheat-sheet/)
    * [C++/CLI in Action](http://www.amazon.com/CLI-Action-Manning-Nishant-Sivakumar/dp/1932394818)
    * [Standard ECMA-372: C++/CLI Language Specification](http://www.ecma-international.org/publications/standards/Ecma-372.htm)
    * For C# developers, don't forget that you can and you should use C++ Interop instead P/Invoke. It provides better performance. 

- Managed C++: I'm really happy Microsoft has deprecated them. It's the predecessor of C++/CLI and has all those weird syntax: \_\_gc, \_\_box and confusing symbols: * for both native and managed type. Coding between it and C++/CLI is really a brain f**k. At a point, I have to convert one project from Managed C++ to C++/CLI to really gets speed up. The conversion process is not as slow as I thought, largely due to the power of VIM (there is a nice Visual Studio extension [ViEmu](http://www.viemu.com/)) and some regex magic. 

For new applications, I'd suggest the following stack:

- (If necessary) use C++/CLI to interop with native C++ libraries and provide core functionality for the program.

- Use C# to code the UI part.

- Code the application's core part first, make it work *without* any GUI: it seperates the business logic and makes the code more testable.

- Use data binding, don't code too much event handler in your GUI.
