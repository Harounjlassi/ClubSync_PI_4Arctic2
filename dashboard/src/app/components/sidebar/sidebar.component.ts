import { Component, OnInit } from '@angular/core';


import * as $ from 'jquery';
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
    { path: '/dashboard', title: 'Dashboard',  icon: 'dashboard', class: '' },
    { path: '/user-profile', title: 'User Profile',  icon:'person', class: '' },
    { path: '/club-list', title: 'Club List', icon: 'groups', class: '' },
    { path: '/announcment-list', title: 'announcment List', icon: 'campaign', class: '' },
    { path: '/user-list', title: 'User List', icon: 'groups', class: '' }, 
    { path: '/reclamation-list', title: 'reclamation List', icon: 'groups', class: '' }, 
    { path: '/projet', title: 'projects',  icon:'unarchive', class: '' },
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor() { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };
}
