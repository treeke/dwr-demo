package test;

import java.util.Arrays;
import java.util.IntSummaryStatistics;
import java.util.List;
import java.util.function.Predicate;
import java.util.stream.Collectors;

public class PredicateTest {
	public static void main(String[] args) {
		/**创建数组，Arrays有一个私有的ArrayList类，继承抽象类AbstractList，封装成asList静态方法*/
		List<Integer> list = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
		/**
		 * Predicate，函数式编程接口，java8新特性
		 * 此处采用的是其中的test方法+lamnda表达式简化代码。test方法返回值是boolean类型
		 * 可通过多规则配置，一次添加filter，对集合进行多规则过滤
		 */
		Predicate<Integer> i = el -> {return el>3;};
		Predicate<Integer> t = el -> {return el<6;};
		
		/**
		 * parallelStream方法为java8中Collection新添加的方法，采用fork/jion框架的盗窃算法，
		 * 盗取其他线程的空余时间片来完成本线程的操作。相当于多线程操作。返回Stream对象
		 * filter方法为Stream接口中的方法，在filter中添加定义好的Predicate过滤规则
		 * and方法为Predicate接口中的方法，表示两个过滤规则之间是&&关系
		 * or方法是Predicate接口中的方法，表示两个过滤规则之间是||关系
		 * collect是Stream接口中的方法添加Collectors.toList()参数将Stream转换为List
		 */
		List<Integer> collect = list.parallelStream().filter(i.and(t)).collect(Collectors.toList());
		System.out.println(collect);
		
		
		List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);  
		IntSummaryStatistics stats = numbers  
		          .stream()  
		          .mapToInt((x) -> x)  
		          .summaryStatistics();
		
		System.out.println("List中最大的数字 : " + stats.getMax());  
		System.out.println("List中最小的数字 : " + stats.getMin());  
		System.out.println("所有数字的总和   : " + stats.getSum());  
		System.out.println("所有数字的平均值 : " + stats.getAverage());   
	}

}
