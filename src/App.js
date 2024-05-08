// src/App.js
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://adymqpasiigoinxtaftt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeW1xcGFzaWlnb2lueHRhZnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUxODEwNzYsImV4cCI6MjAzMDc1NzA3Nn0.8ahBTKSJCNd0OJ-xgOuj6-FwuvE4tfAwmqsRbKzM0p4';

const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [ageFilter, setAgeFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [feesFilter, setFeesFilter] = useState('');
  const [courses, setCourses] = useState([]);
  const [feesOptions, setFeesOptions] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, [roleFilter, ageFilter, courseFilter, feesFilter]);

  const fetchUsers = async () => {
    try {
      let { data: userData, error: userError } = await supabase.from('users').select('*');
      let { data: courseData, error: courseError } = await supabase.from('courses').select('*');

      if (userError || courseError) {
        throw userError || courseError;
      }

      let combinedData = userData.map(user => {
        let courseInfo = courseData.find(course => course.id === user.course_id);
        return {
          ...user,
          course_name: courseInfo ? courseInfo.name : 'N/A',
          teacher: courseInfo ? courseInfo.teacher : 'N/A',
          fees: courseInfo ? courseInfo.fees : 'N/A'
        };
      });

      // Apply filters
      if (roleFilter) {
        combinedData = combinedData.filter(user => user.role.toLowerCase() === roleFilter.toLowerCase());
      }
      if (ageFilter) {
        combinedData = combinedData.filter(user => user.age <= parseInt(ageFilter));
      }
      if (courseFilter) {
        combinedData = combinedData.filter(user => user.course_name.toLowerCase().includes(courseFilter.toLowerCase()));
      }
      if (feesFilter) {
        if (feesFilter.includes('-')) {
          const [minFees, maxFees] = feesFilter.split('-').map(Number);
          combinedData = combinedData.filter(user => user.fees >= minFees && user.fees <= maxFees);
        } else {
          combinedData = combinedData.filter(user => user.fees === parseInt(feesFilter));
        }
      }

      setUsers(combinedData);
    } catch (error) {
      console.error('Error fetching user data:', error.message);
    }
  };

  const fetchCourses = async () => {
    try {
      let { data, error } = await supabase.from('courses').select('*');
      if (error) throw error;

      // Extract unique fees options and categorize them into ranges
      const feesRanges = [
        { label: '80 - 100', min: 80, max: 100 },
        { label: '100 - 120', min: 100, max: 120 }
        // Add more ranges as needed
      ];
      setFeesOptions(feesRanges);

      setCourses(data.map(course => course.name));
    } catch (error) {
      console.error('Error fetching course data:', error.message);
    }
  };

  const handleRoleChange = (event) => {
    const { value } = event.target;
    setRoleFilter(value);
  };

  const handleAgeChange = (event) => {
    const { value } = event.target;
    setAgeFilter(value);
  };

  const handleCourseChange = (event) => {
    const { value } = event.target;
    setCourseFilter(value);
  };

  const handleFeesChange = (event) => {
    const { value } = event.target;
    setFeesFilter(value);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center', backgroundColor: '#333',height: '100%', color: '#fff', padding: '20px' }}>
      <h1>User List</h1>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="role" style={{ marginRight: '10px' }}>Role:</label>
        <select id="role" onChange={handleRoleChange}>
          <option value="">All</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <label htmlFor="age" style={{ marginLeft: '20px', marginRight: '10px' }}>Age &lt;:</label>
        <select id="age" onChange={handleAgeChange}>
          <option value="">All</option>
          <option value="20">20</option>
          <option value="25">25</option>
          <option value="30">30</option>
          <option value="35">35</option>
          <option value="40">40</option>
        </select>
        <label htmlFor="course" style={{ marginLeft: '20px', marginRight: '10px' }}>Course:</label>
        <select id="course" onChange={handleCourseChange}>
          <option value="">All</option>
          {courses.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
        <label htmlFor="fees" style={{ marginLeft: '20px', marginRight: '10px' }}>Fees:</label>
        <select id="fees" onChange={handleFeesChange}>
          <option value="">All</option>
          {feesOptions.map(range => (
            <option key={range.label} value={`${range.min}-${range.max}`}>{range.label}</option>
          ))}
        </select>
      </div>
      <table style={{ borderCollapse: 'collapse', margin: '0 auto', width: '80%', backgroundColor: '#444', color: '#fff' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Email</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Role</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Age</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Course</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Teacher</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Fees</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.role}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.age}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.course_name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.teacher}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>${user.fees}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
