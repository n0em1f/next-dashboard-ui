export const ITEM_PER_PAGE = 10;

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  '/admin(.*)': ['admin'],
  '/student(.*)': ['student'],
  '/teacher(.*)': ['teacher'],
  '/list/teachers(.*)': ['admin', 'teacher', 'student'],
  '/list/students(.*)': ['admin', 'teacher'],
  '/list/subjects(.*)': ['admin', 'teacher', 'student'],
  '/list/classes(.*)': ['admin', 'teacher'],
  '/list/exams(.*)': ['admin', 'teacher', 'student'],
  '/list/assignments(.*)': ['admin', 'teacher', 'student'],
  '/list/results(.*)': ['admin', 'teacher', 'student'],
  '/list/attendance(.*)': ['admin', 'teacher', 'student'],
  '/list/events(.*)': ['admin', 'teacher', 'student'],
  '/list/announcements(.*)': ['admin', 'teacher', 'student'],
  '/list/messages(.*)': ['admin', 'teacher', 'student'],
  '/list/lessons(.*)': ['admin', 'teacher', 'student'],
  '/list/events/(.*)': ['admin', 'teacher', 'student'],
  '/list/announcements/(.*)': ['admin', 'teacher', 'student'],
  '/list/teachers/(.*)': ['admin', 'teacher', 'student'],
  '/profile(.*)': ['admin', 'teacher', 'student'],
  '/settings(.*)': ['admin', 'teacher', 'student'],
};
