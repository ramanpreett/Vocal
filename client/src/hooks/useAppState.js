import { useState, useCallback } from 'react';
import * as api from '../api';

const starterSubjects = [
  'Electrical Wiring',
  'Carpentry',
  'Plumbing',
  'Automotive Repair',
  'Tailoring',
  'Computer Applications',
];

export function useAppState() {
  const [subjects, setSubjects] = useState(starterSubjects);
  const [resources, setResources] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userMap, setUserMap] = useState({});

  const loadState = useCallback(async () => {
    try {
      const res = await api.getState();
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects || starterSubjects);
        setResources(data.resources || []);
      }
    } catch (err) {
      console.error('Failed to load state', err);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await api.getUsers();
      if (res.ok) {
        const users = await res.json();
        const map = {};
        users.forEach((u) => {
          map[u.username.toLowerCase()] = u;
        });
        setUserMap(map);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    }
  }, []);

  const addSubject = useCallback(async (name) => {
    const res = await api.addSubject(name);
    if (res.ok) {
      const newState = await res.json();
      setSubjects(newState.subjects || starterSubjects);
      setResources(newState.resources || []);
      return true;
    }
    return false;
  }, []);

  const uploadResource = useCallback(async (data) => {
    const res = await api.uploadResource(data);
    if (res.ok) {
      const json = await res.json();
      setResources((prev) => [json.resource, ...prev]);
      return json.resource;
    }
    return null;
  }, []);

  const removeResource = useCallback(async (id) => {
    const res = await api.deleteResource(id);
    if (res.ok) {
      setResources((prev) => prev.filter((r) => r.id !== id));
      return true;
    }
    return false;
  }, []);

  const fetchMessages = useCallback(async () => {
    const res = await api.getMessages();
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
    }
  }, []);

  const pushMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updateUserAvatar = useCallback((username, avatar) => {
    setUserMap((prev) => ({
      ...prev,
      [username.toLowerCase()]: {
        ...(prev[username.toLowerCase()] || { username }),
        avatar,
      },
    }));
  }, []);

  return {
    subjects,
    resources,
    messages,
    userMap,
    loadState,
    loadUsers,
    addSubject,
    uploadResource,
    removeResource,
    fetchMessages,
    pushMessage,
    updateUserAvatar,
  };
}
