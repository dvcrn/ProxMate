    alert('in mode');
	
	var element = document.createElement("MyExtensionDataElement");
         element.setAttribute("application_state", "ready");
         document.documentElement.appendChild(element);

         //create a custom event and dispatch it 
         // using the custom element as its target

         var ev = document.createEvent("Events");
         ev.initEvent("MyExtensionEvent", true, false);
         element.dispatchEvent(ev);