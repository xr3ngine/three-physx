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
CMAKE_BINARY_DIR = /src/PhysX/physx/compiler/emscripten-profile

# Include any dependencies generated for this target.
include sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/depend.make

# Include the progress variables for this target.
include sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/progress.make

# Include the compile flags for this target's objects.
include sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/flags.make

sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/src/PhysX/physx/source/physxwebbindings/src/PxWebBindings.cpp.o: sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/flags.make
sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/src/PhysX/physx/source/physxwebbindings/src/PxWebBindings.cpp.o: sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/includes_CXX.rsp
sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/src/PhysX/physx/source/physxwebbindings/src/PxWebBindings.cpp.o: /src/PhysX/physx/source/physxwebbindings/src/PxWebBindings.cpp
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/src/PhysX/physx/compiler/emscripten-profile/CMakeFiles --progress-num=$(CMAKE_PROGRESS_1) "Building CXX object sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/src/PhysX/physx/source/physxwebbindings/src/PxWebBindings.cpp.o"
	cd /src/PhysX/physx/compiler/emscripten-profile/sdk_source_bin && /emsdk_portable/emscripten/sdk/em++  $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -o CMakeFiles/PhysXWebBindings.dir/src/PhysX/physx/source/physxwebbindings/src/PxWebBindings.cpp.o -c /src/PhysX/physx/source/physxwebbindings/src/PxWebBindings.cpp

sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/src/PhysX/physx/source/physxwebbindings/src/PxWebBindings.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/PhysXWebBindings.dir/src/PhysX/physx/source/physxwebbindings/src/PxWebBindings.cpp.i"
	cd /src/PhysX/physx/compiler/emscripten-profile/sdk_source_bin && /emsdk_portable/emscripten/sdk/em++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /src/PhysX/physx/source/physxwebbindings/src/PxWebBindings.cpp > CMakeFiles/PhysXWebBindings.dir/src/PhysX/physx/source/physxwebbindings/src/PxWebBindings.cpp.i

sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/src/PhysX/physx/source/physxwebbindings/src/PxWebBindings.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/PhysXWebBindings.dir/src/PhysX/physx/source/physxwebbindings/src/PxWebBindings.cpp.s"
	cd /src/PhysX/physx/compiler/emscripten-profile/sdk_source_bin && /emsdk_portable/emscripten/sdk/em++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /src/PhysX/physx/source/physxwebbindings/src/PxWebBindings.cpp -o CMakeFiles/PhysXWebBindings.dir/src/PhysX/physx/source/physxwebbindings/src/PxWebBindings.cpp.s

# Object files for target PhysXWebBindings
PhysXWebBindings_OBJECTS = \
"CMakeFiles/PhysXWebBindings.dir/src/PhysX/physx/source/physxwebbindings/src/PxWebBindings.cpp.o"

# External object files for target PhysXWebBindings
PhysXWebBindings_EXTERNAL_OBJECTS =

/src/PhysX/physx/bin/emscripten/profile/physx.profile.js: sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/src/PhysX/physx/source/physxwebbindings/src/PxWebBindings.cpp.o
/src/PhysX/physx/bin/emscripten/profile/physx.profile.js: sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/build.make
/src/PhysX/physx/bin/emscripten/profile/physx.profile.js: /src/PhysX/physx/bin/emscripten/profile/PhysX_static.bc
/src/PhysX/physx/bin/emscripten/profile/physx.profile.js: /src/PhysX/physx/bin/emscripten/profile/PhysXCharacterKinematic_static.bc
/src/PhysX/physx/bin/emscripten/profile/physx.profile.js: /src/PhysX/physx/bin/emscripten/profile/PhysXCommon_static.bc
/src/PhysX/physx/bin/emscripten/profile/physx.profile.js: /src/PhysX/physx/bin/emscripten/profile/PhysXCooking_static.bc
/src/PhysX/physx/bin/emscripten/profile/physx.profile.js: /src/PhysX/physx/bin/emscripten/profile/PhysXExtensions_static.bc
/src/PhysX/physx/bin/emscripten/profile/physx.profile.js: /src/PhysX/physx/bin/emscripten/profile/PhysXFoundation.bc
/src/PhysX/physx/bin/emscripten/profile/physx.profile.js: /src/PhysX/physx/bin/emscripten/profile/PhysXVehicle_static.bc
/src/PhysX/physx/bin/emscripten/profile/physx.profile.js: /src/PhysX/physx/bin/emscripten/profile/PhysX_static.bc
/src/PhysX/physx/bin/emscripten/profile/physx.profile.js: /src/PhysX/physx/bin/emscripten/profile/PhysXCommon_static.bc
/src/PhysX/physx/bin/emscripten/profile/physx.profile.js: /src/PhysX/physx/bin/emscripten/profile/PhysXPvdSDK_static.bc
/src/PhysX/physx/bin/emscripten/profile/physx.profile.js: /src/PhysX/physx/bin/emscripten/profile/PhysXFoundation.bc
/src/PhysX/physx/bin/emscripten/profile/physx.profile.js: sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/linklibs.rsp
/src/PhysX/physx/bin/emscripten/profile/physx.profile.js: sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/objects1.rsp
/src/PhysX/physx/bin/emscripten/profile/physx.profile.js: sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/link.txt
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --bold --progress-dir=/src/PhysX/physx/compiler/emscripten-profile/CMakeFiles --progress-num=$(CMAKE_PROGRESS_2) "Linking CXX executable /src/PhysX/physx/bin/emscripten/profile/physx.profile.js"
	cd /src/PhysX/physx/compiler/emscripten-profile/sdk_source_bin && $(CMAKE_COMMAND) -E cmake_link_script CMakeFiles/PhysXWebBindings.dir/link.txt --verbose=$(VERBOSE)

# Rule to build all files generated by this target.
sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/build: /src/PhysX/physx/bin/emscripten/profile/physx.profile.js

.PHONY : sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/build

sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/clean:
	cd /src/PhysX/physx/compiler/emscripten-profile/sdk_source_bin && $(CMAKE_COMMAND) -P CMakeFiles/PhysXWebBindings.dir/cmake_clean.cmake
.PHONY : sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/clean

sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/depend:
	cd /src/PhysX/physx/compiler/emscripten-profile && $(CMAKE_COMMAND) -E cmake_depends "Unix Makefiles" /src/PhysX/physx/compiler/public /src/PhysX/physx/source/compiler/cmake /src/PhysX/physx/compiler/emscripten-profile /src/PhysX/physx/compiler/emscripten-profile/sdk_source_bin /src/PhysX/physx/compiler/emscripten-profile/sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/DependInfo.cmake --color=$(COLOR)
.PHONY : sdk_source_bin/CMakeFiles/PhysXWebBindings.dir/depend

