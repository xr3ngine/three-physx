# CMAKE generated file: DO NOT EDIT!
# Generated by "Unix Makefiles" Generator, CMake Version 3.14

# Delete rule output on recipe failure.
.DELETE_ON_ERROR:


#=============================================================================
# Special targets provided by cmake.

# Disable implicit rules so canonical targets will work.
.SUFFIXES:


# Remove some rules from gmake that .SUFFIXES does not remove.
SUFFIXES =

.SUFFIXES: .hpux_make_needs_suffix_list


# Suppress display of executed commands.
$(VERBOSE).SILENT:


# A target that is always out of date.
cmake_force:

.PHONY : cmake_force

#=============================================================================
# Set environment variables for the build.

# The shell in which to execute make rules.
SHELL = /bin/sh

# The CMake executable.
CMAKE_COMMAND = /opt/cmake/bin/cmake

# The command to remove a file.
RM = /opt/cmake/bin/cmake -E remove -f

# Escaping for special characters.
EQUALS = =

# The top-level source directory on which CMake was run.
CMAKE_SOURCE_DIR = /src/PhysX/physx/compiler/public

# The top-level build directory on which CMake was run.
CMAKE_BINARY_DIR = /src/PhysX/physx/compiler/emscripten-checked

# Include any dependencies generated for this target.
include sdk_source_bin/CMakeFiles/FastXml.dir/depend.make

# Include the progress variables for this target.
include sdk_source_bin/CMakeFiles/FastXml.dir/progress.make

# Include the compile flags for this target's objects.
include sdk_source_bin/CMakeFiles/FastXml.dir/flags.make

sdk_source_bin/CMakeFiles/FastXml.dir/src/PhysX/physx/source/fastxml/src/PsFastXml.cpp.o: sdk_source_bin/CMakeFiles/FastXml.dir/flags.make
sdk_source_bin/CMakeFiles/FastXml.dir/src/PhysX/physx/source/fastxml/src/PsFastXml.cpp.o: sdk_source_bin/CMakeFiles/FastXml.dir/includes_CXX.rsp
sdk_source_bin/CMakeFiles/FastXml.dir/src/PhysX/physx/source/fastxml/src/PsFastXml.cpp.o: /src/PhysX/physx/source/fastxml/src/PsFastXml.cpp
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/src/PhysX/physx/compiler/emscripten-checked/CMakeFiles --progress-num=$(CMAKE_PROGRESS_1) "Building CXX object sdk_source_bin/CMakeFiles/FastXml.dir/src/PhysX/physx/source/fastxml/src/PsFastXml.cpp.o"
	cd /src/PhysX/physx/compiler/emscripten-checked/sdk_source_bin && /emsdk_portable/emscripten/sdk/em++  $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -o CMakeFiles/FastXml.dir/src/PhysX/physx/source/fastxml/src/PsFastXml.cpp.o -c /src/PhysX/physx/source/fastxml/src/PsFastXml.cpp

sdk_source_bin/CMakeFiles/FastXml.dir/src/PhysX/physx/source/fastxml/src/PsFastXml.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/FastXml.dir/src/PhysX/physx/source/fastxml/src/PsFastXml.cpp.i"
	cd /src/PhysX/physx/compiler/emscripten-checked/sdk_source_bin && /emsdk_portable/emscripten/sdk/em++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /src/PhysX/physx/source/fastxml/src/PsFastXml.cpp > CMakeFiles/FastXml.dir/src/PhysX/physx/source/fastxml/src/PsFastXml.cpp.i

sdk_source_bin/CMakeFiles/FastXml.dir/src/PhysX/physx/source/fastxml/src/PsFastXml.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/FastXml.dir/src/PhysX/physx/source/fastxml/src/PsFastXml.cpp.s"
	cd /src/PhysX/physx/compiler/emscripten-checked/sdk_source_bin && /emsdk_portable/emscripten/sdk/em++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /src/PhysX/physx/source/fastxml/src/PsFastXml.cpp -o CMakeFiles/FastXml.dir/src/PhysX/physx/source/fastxml/src/PsFastXml.cpp.s

FastXml: sdk_source_bin/CMakeFiles/FastXml.dir/src/PhysX/physx/source/fastxml/src/PsFastXml.cpp.o
FastXml: sdk_source_bin/CMakeFiles/FastXml.dir/build.make

.PHONY : FastXml

# Rule to build all files generated by this target.
sdk_source_bin/CMakeFiles/FastXml.dir/build: FastXml

.PHONY : sdk_source_bin/CMakeFiles/FastXml.dir/build

sdk_source_bin/CMakeFiles/FastXml.dir/clean:
	cd /src/PhysX/physx/compiler/emscripten-checked/sdk_source_bin && $(CMAKE_COMMAND) -P CMakeFiles/FastXml.dir/cmake_clean.cmake
.PHONY : sdk_source_bin/CMakeFiles/FastXml.dir/clean

sdk_source_bin/CMakeFiles/FastXml.dir/depend:
	cd /src/PhysX/physx/compiler/emscripten-checked && $(CMAKE_COMMAND) -E cmake_depends "Unix Makefiles" /src/PhysX/physx/compiler/public /src/PhysX/physx/source/compiler/cmake /src/PhysX/physx/compiler/emscripten-checked /src/PhysX/physx/compiler/emscripten-checked/sdk_source_bin /src/PhysX/physx/compiler/emscripten-checked/sdk_source_bin/CMakeFiles/FastXml.dir/DependInfo.cmake --color=$(COLOR)
.PHONY : sdk_source_bin/CMakeFiles/FastXml.dir/depend

