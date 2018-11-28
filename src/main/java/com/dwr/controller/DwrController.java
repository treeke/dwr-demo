package com.dwr.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dwr.config.DwrPush;

@RestController
public class DwrController {
	
	@RequestMapping("/test")
	public String dd(){
        DwrPush.sendMsg("/dwr.html","hello");
        return "ww";
    }

}
