// src/navigation/AppNavigator.js
import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import Signup from "../components/Signup";
import Login from "../components/Login";
import TeacherHome from "../screens/TeacherHome";
import StudentHome from "../screens/StudentHome";
import Chat from "../components/Chat";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) setUserRole(docSnap.data().role);
      } else setUserRole(null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null; // or show a loading spinner

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!userRole ? (
          <>
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="Login" component={Login} />
          </>
        ) : userRole === "teacher" ? (
          <>
            <Stack.Screen name="TeacherHome" component={TeacherHome} />
            {/* Chat route for teacher with studentUid param */}
            <Stack.Screen
              name="Chat"
              component={Chat}
              initialParams={{ studentUid: null }} // will pass student UID when navigating
            />
          </>
        ) : (
          <>
            <Stack.Screen name="StudentHome" component={StudentHome} />
            {/* Chat route for student with teacherUid param */}
            <Stack.Screen
              name="Chat"
              component={Chat}
              initialParams={{ studentUid: null }} // pass teacher UID when navigating
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
