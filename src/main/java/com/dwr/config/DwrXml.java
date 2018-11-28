package com.dwr.config;

import org.directwebremoting.Container;
import org.directwebremoting.create.NewCreator;
import org.directwebremoting.extend.Configurator;
import org.directwebremoting.extend.CreatorManager;

public class DwrXml implements Configurator{
	
	@Override
    public void configure(Container container) {
        CreatorManager creatorManager= container.getBean(CreatorManager.class);
        NewCreator creator = new NewCreator();
        creator.setClass("com.dwr.config.DwrPush");
        creator.setJavascript("DwrPush");
        creatorManager.addCreator(creator);
    }

}
