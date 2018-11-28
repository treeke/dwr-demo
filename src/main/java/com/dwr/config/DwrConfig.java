package com.dwr.config;

import java.util.HashMap;
import java.util.Map;

import org.directwebremoting.servlet.DwrListener;
import org.directwebremoting.servlet.DwrServlet;
import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DwrConfig {
	@Bean
    public ServletRegistrationBean dwr(){
        ServletRegistrationBean servlet = new ServletRegistrationBean(new DwrServlet(),"/dwr/*");
        Map<String,String> initParam = new HashMap<String, String>();
        initParam.put("crossDomainSessionSecurity","false");
        initParam.put("allowScriptTagRemoting","true");
        initParam.put("classes","java.lang.Object");
        initParam.put("activeReverseAjaxEnabled","true");
        initParam.put("initApplicationScopeCreatorsAtStartup","true");
        initParam.put("maxWaitAfterWrite","60000");
        initParam.put("debug","true");
        initParam.put("logLevel","WARN");
        initParam.put("logLevel","WARN");
        //自定义配置，org.directwebremoting.impl.StartupUtil#configureFromInitParams name.equals("customConfigurator")
        //DwrServlet#init 初始化this.container
        initParam.put("customConfigurator","com.dwr.config.DwrXml");
        servlet.setInitParameters(initParam);
        return servlet;
    }

    @Bean
    public ServletListenerRegistrationBean dwrListener(){
        ServletListenerRegistrationBean listener = new ServletListenerRegistrationBean(new DwrListener());
        return listener;
    }


}
