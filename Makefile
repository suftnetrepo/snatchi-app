# ============================================================
#  GLOBALS
# ============================================================
APP_ID := com.suftnet.snatchi
ANDROID_APP := android/app/build/outputs/apk
IOS_PROJECT := ios
DEVICE_ID :=R58TA0L5RPK

# ============================================================
#  ANDROID COMMANDS
# ============================================================

# --- DEV ---
android-start:
	@npm start

android-run:
	npx react-native run-android

android-build-debug:
	cd android && ./gradlew assembleDebug

android-build-release:
	cd android && ./gradlew assembleRelease

android-install-debug:
	adb install -r $(ANDROID_APP)/debug/app-debug.apk

android-install-release:
	adb install -r $(ANDROID_APP)/release/app-release.apk

android-uninstall:
	adb uninstall $(APP_ID)

android-reinstall-debug: android-uninstall android-install-debug
android-reinstall-release: android-uninstall android-install-release

android-devices:
	adb devices

android-install-on-device:
	@if [ -z "$(DEVICE_ID)" ]; then \
		echo "Usage: make android-install-on-device DEVICE_ID=<id>"; \
	else \
		adb -s $(DEVICE_ID) install -r $(ANDROID_APP)/debug/app-debug.apk; \
	fi

# --- LOGCAT ---
logcat:
	adb logcat

logcat-js:
	adb logcat *:S ReactNativeJS:V

logcat-app:
	adb logcat | grep $(APP_ID)

logcat-clear:
	adb logcat -c

# --- WIPE APP DATA ---
android-clear-data:
	adb shell pm clear $(APP_ID)

# --- WIPE EMULATOR ---
avd-list:
	@emulator -list-avds

avd-start:
	@if [ -z "$(DEVICE_ID)" ]; then \
		echo "Usage: make avd-start DEVICE_ID=<avd_name>"; \
	else \
		emulator -avd $(DEVICE_ID) & \
	fi

# ============================================================
#  iOS COMMANDS
# ============================================================

ios-run:
	npx react-native run-ios

ios-run-device:
	npx react-native run-ios --device "iPhone"

ios-build:
	cd ios && xcodebuild -workspace Snatchi.xcworkspace -scheme Snatchi -configuration Debug -sdk iphonesimulator -derivedDataPath build

ios-build-release:
	cd ios && xcodebuild -workspace Snatchi.xcworkspace -scheme Snatchi -configuration Release -sdk iphoneos -derivedDataPath build

ios-clean:
	cd ios && xcodebuild clean

ios-pods:
	cd ios && pod install

ios-open:
	open ios/Snatchi.xcworkspace

# ============================================================
#  METRO CLEAN / CACHE RESET
# ============================================================

clean-metro:
	rm -rf node_modules
	npm install
	npx react-native start --reset-cache

# ============================================================
#  PROJECT CLEANERS
# ============================================================

clean-android:
	cd android && ./gradlew clean

clean-ios:
	cd ios && xcodebuild clean

clean-all: clean-android clean-ios
	rm -rf node_modules
	npm install

# ============================================================
#  HELP
# ============================================================

help:
	@echo ""
	@echo "Available commands:"
	@echo ""
	@echo "--- Android ---"
	@echo "make android-run"
	@echo "make android-build-debug"
	@echo "make android-build-release"
	@echo "make android-install-debug"
	@echo "make android-install-release"
	@echo "make android-uninstall"
	@echo "make logcat"
	@echo "make logcat-js"
	@echo "make android-clear-data"
	@echo ""
	@echo "--- iOS ---"
	@echo "make ios-run"
	@echo "make ios-run-device"
	@echo "make ios-build"
	@echo "make ios-build-release"
	@echo "make ios-open"
	@echo "make ios-clean"
	@echo ""
	@echo "--- Tools ---"
	@echo "make clean-metro"
	@echo "make clean-all"
	@echo ""
